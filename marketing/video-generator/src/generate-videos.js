/**
 * PartyTab Video Generator - Full Pipeline
 *
 * 1. Takes input TikTok clips
 * 2. Categorizes them using AI vision (Ollama/LLaVA)
 * 3. Records themed PartyTab demos
 * 4. Generates TikTok TTS voiceover
 * 5. Stitches everything together
 * 6. Outputs to weekly folders
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";
import { categorizeVideo, checkOllama } from "./categorize-video.js";
import { getTemplate } from "./trip-templates.js";
import { generateTTS, VOICES } from "./tiktok-tts.js";
import { recordDemo } from "./record-demo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const execAsync = promisify(exec);

const INPUT_DIR = path.join(__dirname, "..", "input");
const OUTPUT_DIR = path.join(__dirname, "..", "output");
const ASSETS_DIR = path.join(__dirname, "..", "assets");
const TEMP_DIR = path.join(__dirname, "..", "temp");

const POSTS_PER_WEEK = parseInt(process.env.POSTS_PER_WEEK) || 7;
const START_DATE = process.env.START_DATE || new Date().toISOString().split("T")[0];

// Stitch duration (how much of the original TikTok to use)
const STITCH_DURATION = 3;

// Voiceover scripts per category
const SCRIPTS = {
  ski: [
    "Ski trips are amazing",
    "But splitting the cabin, lift tickets, and groceries?",
    "That's where it gets messy",
    "PartyTab tracks everything as you go",
    "Free at partytab.app",
  ],
  beach: [
    "Beach house. Jet skis. Dinners out.",
    "Someone's gotta keep track of all that",
    "With PartyTab, everyone logs expenses as they happen",
    "At the end? One tap to settle up",
    "Link in bio",
  ],
  bachelor: [
    "Bachelor parties get expensive fast",
    "Airbnb, bottles, steakhouse, golf",
    "PartyTab makes sure everyone pays their share",
    "No awkward conversations needed",
    "Free at partytab.app",
  ],
  bachelorette: [
    "Bachelorette weekend!",
    "Airbnb, spa, brunch, wine tour",
    "Who paid for what? PartyTab knows.",
    "Settle up with one payment at the end",
    "Link in bio",
  ],
  roadtrip: [
    "Road trips are all fun until",
    "Someone asks about gas money",
    "PartyTab tracks every expense along the way",
    "No spreadsheets. No drama.",
    "Free at partytab.app",
  ],
  camping: [
    "Camping with friends",
    "Campsite, firewood, food, gear",
    "PartyTab handles the math",
    "So you can focus on the s'mores",
    "Link in bio",
  ],
  lake: [
    "Lake house weekend",
    "Boat rental, groceries, the house itself",
    "PartyTab tracks who paid what",
    "Settle up before you leave",
    "Free at partytab.app",
  ],
  city: [
    "City trip with the crew",
    "Hotel, concerts, fancy dinners",
    "PartyTab keeps track of everything",
    "One payment settles it all",
    "Link in bio",
  ],
  vegas: [
    "Vegas trips are legendary",
    "The bill? Not so much.",
    "PartyTab tracks every expense",
    "No more chasing payments for weeks",
    "Free at partytab.app",
  ],
  hiking: [
    "Hiking trip with friends",
    "Cabin, gear, permits, snacks",
    "Log it all in PartyTab",
    "The math handles itself",
    "Link in bio",
  ],
  generic: [
    "Group trips are the best",
    "Until someone asks who owes what",
    "PartyTab tracks expenses as you go",
    "Settle up with one simple payment",
    "Free at partytab.app",
  ],
};

// Ensure directories exist
[INPUT_DIR, OUTPUT_DIR, ASSETS_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Get all input videos
 */
function getInputVideos() {
  return fs
    .readdirSync(INPUT_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => path.join(INPUT_DIR, f));
}

/**
 * Get video duration
 */
async function getVideoDuration(videoPath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    return 10;
  }
}

/**
 * Extract stitch clip (first N seconds)
 */
async function extractStitchClip(inputPath, outputPath, duration = STITCH_DURATION) {
  await execAsync(
    `ffmpeg -y -i "${inputPath}" -t ${duration} -c:v libx264 -c:a aac "${outputPath}"`
  );
}

/**
 * Generate week folder name
 */
function getWeekFolderName(startDate, weekNumber) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + (weekNumber - 1) * 7);
  const month = date.toLocaleString("en-US", { month: "short" }).toLowerCase();
  const day = date.getDate().toString().padStart(2, "0");
  return `week-${weekNumber.toString().padStart(2, "0")}-${month}-${day}`;
}

/**
 * Generate filename with date
 */
function getVideoFilename(startDate, dayOffset) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayOffset);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dayName = date.toLocaleString("en-US", { weekday: "short" }).toLowerCase();
  return `${year}-${month}-${day}-${dayName}.mp4`;
}

/**
 * Generate TTS voiceover for a category
 */
async function generateVoiceover(category, tempDir) {
  const lines = SCRIPTS[category] || SCRIPTS.generic;
  const audioFiles = [];

  for (let i = 0; i < lines.length; i++) {
    const audioPath = path.join(tempDir, `line-${i}.mp3`);
    console.log(`      TTS: "${lines[i]}"`);

    try {
      await generateTTS(lines[i], audioPath, VOICES.JESSIE);
      audioFiles.push(audioPath);
    } catch (error) {
      console.log(`      ⚠️ TTS failed, creating silence`);
      await execAsync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 2 "${audioPath}"`);
      audioFiles.push(audioPath);
    }

    // Small delay between TTS calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  // Concatenate with small pauses between lines
  const listFile = path.join(tempDir, "audio-list.txt");
  const silencePath = path.join(tempDir, "silence.mp3");

  // Create short silence for pacing
  await execAsync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 "${silencePath}"`);

  // Build list with silences
  const listContent = audioFiles.map((f) => `file '${f}'\nfile '${silencePath}'`).join("\n");
  fs.writeFileSync(listFile, listContent);

  const outputAudio = path.join(tempDir, "voiceover.mp3");
  await execAsync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputAudio}"`);

  return outputAudio;
}

/**
 * Stitch everything together: source clip + demo + voiceover
 */
async function createFinalVideo(stitchClip, demoPath, voiceoverPath, outputPath, tempDir) {
  // Concatenate stitch clip and demo
  const videoListFile = path.join(tempDir, "video-list.txt");

  // We need to re-encode to ensure compatibility
  const stitchReencoded = path.join(tempDir, "stitch-reencoded.mp4");
  const demoReencoded = path.join(tempDir, "demo-reencoded.mp4");

  // Re-encode both to same format
  await execAsync(
    `ffmpeg -y -i "${stitchClip}" -c:v libx264 -c:a aac -ar 44100 -r 30 -s 390x844 "${stitchReencoded}"`
  );

  if (fs.existsSync(demoPath)) {
    await execAsync(
      `ffmpeg -y -i "${demoPath}" -c:v libx264 -c:a aac -ar 44100 -r 30 -s 390x844 "${demoReencoded}"`
    );
    fs.writeFileSync(videoListFile, `file '${stitchReencoded}'\nfile '${demoReencoded}'`);
  } else {
    fs.writeFileSync(videoListFile, `file '${stitchReencoded}'`);
  }

  // Concatenate videos
  const concatenatedVideo = path.join(tempDir, "concatenated.mp4");
  await execAsync(`ffmpeg -y -f concat -safe 0 -i "${videoListFile}" -c copy "${concatenatedVideo}"`);

  // Add voiceover (mix with original audio, voiceover louder)
  await execAsync(
    `ffmpeg -y -i "${concatenatedVideo}" -i "${voiceoverPath}" -filter_complex "[0:a]volume=0.3[a1];[1:a]volume=1.0[a2];[a1][a2]amix=inputs=2:duration=longest[a]" -map 0:v -map "[a]" -c:v copy -c:a aac "${outputPath}"`
  );

  return outputPath;
}

/**
 * Main generation pipeline
 */
async function generateVideos() {
  console.log("🎬 PartyTab Video Generator - Full Pipeline\n");

  // Check Ollama status
  const ollamaStatus = await checkOllama();
  if (!ollamaStatus.running) {
    console.log("⚠️  Ollama not running. Videos will use 'generic' category.");
    console.log("   To enable AI categorization:");
    console.log("   1. Install Ollama: https://ollama.ai");
    console.log("   2. Run: ollama pull llava");
    console.log("   3. Start Ollama\n");
  } else if (!ollamaStatus.hasLlava) {
    console.log("⚠️  LLaVA model not found. Run: ollama pull llava\n");
  } else {
    console.log("✅ Ollama + LLaVA ready for AI categorization\n");
  }

  const inputVideos = getInputVideos();

  if (inputVideos.length === 0) {
    console.log("❌ No input videos found in:", INPUT_DIR);
    console.log("   Share some TikTok links with @PartyTab_TokBot first!\n");
    return;
  }

  console.log(`📹 Found ${inputVideos.length} input video(s)`);
  console.log(`📅 Generating daily posts starting from ${START_DATE}\n`);

  const weeksNeeded = Math.ceil(inputVideos.length / POSTS_PER_WEEK);

  let videoIndex = 0;
  let dayOffset = 0;

  for (let week = 1; week <= weeksNeeded; week++) {
    const weekFolder = getWeekFolderName(START_DATE, week);
    const weekPath = path.join(OUTPUT_DIR, weekFolder);
    fs.mkdirSync(weekPath, { recursive: true });

    console.log(`\n📁 ${weekFolder}/`);

    for (let dayInWeek = 0; dayInWeek < POSTS_PER_WEEK && videoIndex < inputVideos.length; dayInWeek++) {
      const inputVideo = inputVideos[videoIndex];
      const filename = getVideoFilename(START_DATE, dayOffset);
      const outputPath = path.join(weekPath, filename);

      console.log(`\n  [${videoIndex + 1}/${inputVideos.length}] ${filename}`);

      const videoTempDir = path.join(TEMP_DIR, `video-${videoIndex}-${Date.now()}`);
      fs.mkdirSync(videoTempDir, { recursive: true });

      try {
        // 1. Categorize the video
        console.log("    Step 1: Categorizing...");
        const category = await categorizeVideo(inputVideo, videoTempDir);
        const template = getTemplate(category);
        console.log(`    → ${template.name} ${template.emoji}`);

        // 2. Extract stitch clip
        console.log("    Step 2: Extracting stitch clip...");
        const stitchClip = path.join(videoTempDir, "stitch.mp4");
        await extractStitchClip(inputVideo, stitchClip, STITCH_DURATION);

        // 3. Record PartyTab demo (or use pre-recorded)
        console.log("    Step 3: Recording PartyTab demo...");
        const demoPath = path.join(videoTempDir, "demo.mp4");
        await recordDemo(category, demoPath);

        // 4. Generate voiceover
        console.log("    Step 4: Generating voiceover...");
        const voiceoverPath = await generateVoiceover(category, videoTempDir);

        // 5. Stitch it all together
        console.log("    Step 5: Creating final video...");
        await createFinalVideo(stitchClip, demoPath, voiceoverPath, outputPath, videoTempDir);

        console.log(`    ✅ Complete: ${filename}`);

      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
      }

      // Cleanup temp directory
      fs.rmSync(videoTempDir, { recursive: true, force: true });

      videoIndex++;
      dayOffset++;
    }
  }

  console.log("\n\n🎉 Video generation complete!");
  console.log(`📁 Output folder: ${OUTPUT_DIR}`);
  console.log("\nNext steps:");
  console.log("1. Review the generated videos");
  console.log("2. Go to TikTok.com on desktop");
  console.log("3. Upload each week's videos and schedule them");
}

// Run the generator
generateVideos().catch(console.error);
