/**
 * TikTok Text-to-Speech Generator
 * Uses TikTok's unofficial TTS API to generate the classic TikTok voice
 */

import https from 'https';
import fs from 'fs';

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

/**
 * Generate TTS audio using TikTok's API
 */
export async function generateTTS(text, outputPath, voice = DEFAULT_VOICE) {
  return new Promise((resolve, reject) => {
    // TikTok's TTS endpoint
    const postData = JSON.stringify({
      text_speaker: voice,
      req_text: text,
      speaker_map_type: 0,
      aid: 1233,
    });

    const options = {
      hostname: 'api16-normal-v6.tiktokv.com',
      port: 443,
      path: '/media/api/text/speech/invoke/',
      method: 'POST',
      headers: {
        'User-Agent': 'com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.status_code !== 0) {
            reject(new Error(`TTS API error: ${response.message || 'Unknown error'}`));
            return;
          }

          // Decode base64 audio
          const audioBuffer = Buffer.from(response.data.v_str, 'base64');

          // Save to file
          fs.writeFileSync(outputPath, audioBuffer);
          resolve(outputPath);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
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

// Export default voice for convenience
export { DEFAULT_VOICE };
