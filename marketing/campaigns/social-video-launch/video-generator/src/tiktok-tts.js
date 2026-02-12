/**
 * Text-to-Speech Generator
 *
 * Priority:
 * 1. TikTok's unofficial TTS API (the classic TikTok voice)
 * 2. ElevenLabs (highest quality, 10k chars/month free)
 * 3. Microsoft Edge Neural TTS (free, decent — via edge-tts)
 * 4. macOS `say` command (built into every Mac)
 * 5. Silent audio fallback (so the pipeline never breaks)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TikTok TTS voices
export const VOICES = {
  // English - US
  JESSIE: 'en_us_001',           // Female (the classic one)
  JOEY: 'en_us_006',             // Male
  PROFESSOR: 'en_us_007',        // Male, narrative
  SCIENTIST: 'en_us_009',        // Male
  CONFIDENCE: 'en_us_010',       // Male

  // English - UK
  UK_MALE_1: 'en_uk_001',
  UK_MALE_2: 'en_uk_003',

  // English - AU
  AU_FEMALE: 'en_au_001',
  AU_MALE: 'en_au_002',

  // Character voices
  GHOSTFACE: 'en_us_ghostface',
  CHEWBACCA: 'en_us_chewbacca',
  C3PO: 'en_us_c3po',
  STITCH: 'en_us_stitch',
  STORMTROOPER: 'en_us_stormtrooper',
  ROCKET: 'en_us_rocket',
};

// Default to the classic TikTok female voice
const DEFAULT_VOICE = VOICES.JESSIE;

// Edge TTS config (Microsoft Neural voices — best free option)
const EDGE_TTS_BIN = path.resolve(__dirname, '..', '.venv', 'bin', 'edge-tts');
const EDGE_VOICE = 'en-US-JennyNeural'; // Natural female, great for short-form
const EDGE_RATE = '+25%'; // Slightly faster for TikTok energy

// macOS fallback voice
const MAC_VOICE = 'Shelley (English (US))';

// TikTok API session ID (required for TTS API to work)
const TIKTOK_SESSION_ID = process.env.TIKTOK_SESSION_ID || '';

// ElevenLabs config (best quality, 10k chars/month free)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Sarah — young, clear, conversational
const ELEVENLABS_MODEL = 'eleven_multilingual_v2';

// Track which TTS method we're using (log once)
let loggedMethod = false;

/**
 * Try TikTok's unofficial TTS API
 */
function tryTikTokTTS(text, outputPath, voice = DEFAULT_VOICE) {
  return new Promise((resolve, reject) => {
    // Skip TikTok TTS if no session ID is configured
    if (!TIKTOK_SESSION_ID) {
      return reject(new Error('No TikTok session ID configured'));
    }

    const postData = JSON.stringify({
      text_speaker: voice,
      req_text: text,
      speaker_map_type: 0,
      aid: 1233,
    });

    const options = {
      hostname: 'api16-normal-c-useast1a.tiktokv.com',
      port: 443,
      path: '/media/api/text/speech/invoke/',
      method: 'POST',
      timeout: 8000,
      headers: {
        'User-Agent': 'com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': `sessionid=${TIKTOK_SESSION_ID}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status_code !== 0 || !response.data?.v_str) {
            reject(new Error(`TTS API error: ${response.message || 'no audio data'}`));
            return;
          }
          const audioBuffer = Buffer.from(response.data.v_str, 'base64');
          fs.writeFileSync(outputPath, audioBuffer);
          resolve('tiktok');
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('TTS API timeout')); });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Try ElevenLabs TTS API
 * Best quality, 10k chars/month free tier
 */
async function tryElevenLabs(text, outputPath) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('No ElevenLabs API key configured');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.85,
          style: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${err}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, audioBuffer);

  return 'elevenlabs';
}

/**
 * Try Microsoft Edge Neural TTS (via edge-tts Python package)
 * High quality, free, no API key needed
 */
async function tryEdgeTTS(text, outputPath) {
  if (!fs.existsSync(EDGE_TTS_BIN)) {
    throw new Error('edge-tts not installed (run: python3 -m venv .venv && .venv/bin/pip install edge-tts)');
  }

  // Write text to a temp file to avoid all shell escaping issues
  const textFile = outputPath + '.txt';
  fs.writeFileSync(textFile, text);
  try {
    await execAsync(
      `${EDGE_TTS_BIN} --voice "${EDGE_VOICE}" --rate="${EDGE_RATE}" --file "${textFile}" --write-media "${outputPath}"`
    );
  } finally {
    if (fs.existsSync(textFile)) fs.unlinkSync(textFile);
  }

  return 'edge-tts';
}

/**
 * Try macOS `say` command
 * Outputs AIFF then converts to MP3 via FFmpeg
 */
async function tryMacOSSay(text, outputPath) {
  const aiffPath = outputPath.replace(/\.\w+$/, '.aiff');

  // Check if `say` exists
  try {
    await execAsync('which say');
  } catch {
    throw new Error('macOS say not available');
  }

  // Generate speech
  const escapedText = text.replace(/"/g, '\\"');
  await execAsync(`say -v "${MAC_VOICE}" -r 195 -o "${aiffPath}" "${escapedText}"`);

  // Convert to MP3
  await execAsync(`ffmpeg -y -i "${aiffPath}" -acodec libmp3lame -ar 44100 "${outputPath}"`);

  // Clean up AIFF
  if (fs.existsSync(aiffPath)) fs.unlinkSync(aiffPath);

  return 'macos';
}

/**
 * Generate silent audio as final fallback
 * Duration is roughly estimated from text length
 */
async function generateSilence(text, outputPath) {
  // Estimate ~150 words per minute, ~5 chars per word
  const words = text.length / 5;
  const duration = Math.max(1, Math.min(words / 2.5, 5)); // 1-5 seconds

  await execAsync(
    `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration.toFixed(1)} -acodec libmp3lame "${outputPath}"`
  );

  return 'silence';
}

/**
 * Generate TTS audio — tries each method in order
 */
export async function generateTTS(text, outputPath, voice = DEFAULT_VOICE) {
  // 1. Try TikTok API
  try {
    const method = await tryTikTokTTS(text, outputPath, voice);
    if (!loggedMethod) {
      console.log('      🔊 Using TikTok TTS voice');
      loggedMethod = true;
    }
    return method;
  } catch {
    // Fall through
  }

  // 2. Try ElevenLabs (highest quality)
  try {
    const method = await tryElevenLabs(text, outputPath);
    if (!loggedMethod) {
      console.log('      🔊 Using ElevenLabs TTS (Sarah)');
      loggedMethod = true;
    }
    return method;
  } catch {
    // Fall through
  }

  // 3. Try Edge TTS (Microsoft Neural voices)
  try {
    const method = await tryEdgeTTS(text, outputPath);
    if (!loggedMethod) {
      console.log('      🔊 Using Microsoft Edge Neural TTS (JennyNeural)');
      loggedMethod = true;
    }
    return method;
  } catch {
    // Fall through
  }

  // 4. Try macOS say
  try {
    const method = await tryMacOSSay(text, outputPath);
    if (!loggedMethod) {
      console.log('      🔊 Using macOS text-to-speech');
      loggedMethod = true;
    }
    return method;
  } catch {
    // Fall through
  }

  // 5. Silent fallback
  if (!loggedMethod) {
    console.log('      🔇 No TTS available — using silent audio');
    loggedMethod = true;
  }
  return generateSilence(text, outputPath);
}

/**
 * Generate TTS for multiple lines and concatenate
 */
export async function generateMultiLineTTS(lines, outputDir, voice = DEFAULT_VOICE) {
  const audioPaths = [];

  for (let i = 0; i < lines.length; i++) {
    const outputPath = `${outputDir}/line-${i}.mp3`;
    await generateTTS(lines[i], outputPath, voice);
    audioPaths.push(outputPath);
  }

  return audioPaths;
}

export { DEFAULT_VOICE };
