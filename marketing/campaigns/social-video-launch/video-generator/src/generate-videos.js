/**
 * PartyTab Video Generator - Full Pipeline
 *
 * 1. Takes input TikTok clips
 * 2. Categorizes them using TikTok metadata + manual overrides
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
import { categorizeVideo } from "./categorize-video.js";
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

// Crossfade transition duration between hook and demo
const CROSSFADE_DURATION = 0.5;

// Demo animation frame counts (at 30fps) — fixed costs per scene
const FPS = 30;
const SCENE1_FIXED = 77;  // expense reveals: 5×(5 transition + 8 hold) + 4×3 pause
const SCENE2_FIXED = 49;  // sceneSwitch(2) + banner(6+8) + 3×(5 transition + 6 hold)
const SCENE34_FIXED = 39; // transfer completes + all-settled: 3×(5 transition + 6 hold) + 6 animation
const SCENE5_FIXED = 10;  // CTA fade: 10 screenshot frames

// Voiceover scripts per category
// Structure: line 0+1 → expenses scene, line 2 → settlement, line 3 → transfers, line 4 → CTA
const SCRIPTS = {
  ski: [
    "Ski trip with friends",
    "Four people, five expenses, nobody remembers who paid for what",
    "PartyTab tracks it all in one place",
    "Hit settle up and it tells you exactly who owes who",
    "It's free. Link in bio.",
  ],
  beach: [
    "Beach trip with the crew",
    "House, jet skis, dinners. Who's keeping track?",
    "PartyTab logs every expense as it happens",
    "At the end, one tap and everyone's settled",
    "It's free. Link in bio.",
  ],
  bachelor: [
    "Bachelor party weekend",
    "Airbnb, bottles, steakhouse, golf. Someone dropped a lot.",
    "PartyTab splits it all up",
    "No spreadsheets, no chasing people for money",
    "It's free. Link in bio.",
  ],
  bachelorette: [
    "Bachelorette weekend",
    "Airbnb, spa, brunch, wine tour. Who paid for what?",
    "PartyTab tracks every expense",
    "One tap at the end and everyone's even",
    "It's free. Link in bio.",
  ],
  roadtrip: [
    "Road trip with the homies",
    "Gas, food stops, the motel. Who's covering what?",
    "PartyTab keeps a running tab",
    "Trip's over, hit settle up, done",
    "It's free. Link in bio.",
  ],
  camping: [
    "Camping with friends",
    "Firewood, food, campsite, gas. It all adds up.",
    "PartyTab tracks all of it",
    "When it's time to leave, everyone settles up in one tap",
    "It's free. Link in bio.",
  ],
  lake: [
    "Lake house with the crew",
    "The rental, the boat, groceries, all of it adds up fast",
    "PartyTab tracks every single expense",
    "Hit settle up and it's done",
    "It's free. Link in bio.",
  ],
  city: [
    "City trip with friends",
    "Hotel, concerts, dinners, Ubers. The expenses pile up.",
    "PartyTab keeps track of who paid for what",
    "One payment at the end and you're square",
    "Link in bio",
  ],
  vegas: [
    "Vegas with the squad",
    "The suite, the club, the shows. Nobody remembers who paid for what.",
    "PartyTab does",
    "One tap to settle up, no drama",
    "It's free. Link in bio.",
  ],
  hiking: [
    "Hiking trip with the group",
    "Cabin, gear, and trail snacks between four friends",
    "PartyTab does the math for you",
    "One tap to settle up, everyone pays their share",
    "It's free. Link in bio.",
  ],
  generic: [
    "Group trips with friends",
    "Splitting costs with four people and a dozen expenses is no fun",
    "PartyTab tracks who paid for what",
    "When the trip's over, one tap settles it all",
    "It's free. Link in bio.",
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
 * NOTE: Currently unused but kept for potential future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getVideoDuration(videoPath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    return parseFloat(stdout.trim());
  } catch {
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
 * Calculate scene-specific padding based on voiceover line durations
 */
function calculateScenePadding(lineDurations) {
  // Line-to-scene mapping:
  // Lines 0+1 → Scene 1 (expenses appearing)
  // Line 2 → Scene 2 (settlement banner + transfers)
  // Line 3 → Scene 3+4 (transfers completing + all settled)
  // Line 4 → Scene 5 (CTA)

  const scene1Duration = lineDurations[0] + 0.25 + lineDurations[1]; // 0.25s gap between lines 0-1
  const scene2Duration = lineDurations[2];
  const scene34Duration = lineDurations[3];
  const scene5Duration = lineDurations[4] + 0.15; // small buffer for CTA

  // Convert to target frame counts
  const scene1Target = Math.ceil(scene1Duration * FPS);
  const scene2Target = Math.ceil(scene2Duration * FPS);
  const scene34Target = Math.ceil(scene34Duration * FPS);
  const scene5Target = Math.ceil(scene5Duration * FPS);

  // Scene 1: emptyDashboard (fixed 10) + animation (77) + fullListHold (padding)
  const emptyDashboard = 10;
  const fullListHold = Math.min(55, Math.max(8, scene1Target - SCENE1_FIXED - emptyDashboard));

  // Scene 2: sceneSwitch (fixed 2) + animation (49) + afterTransfersHold (padding)
  const sceneSwitch = 2;
  const afterTransfersHold = Math.min(30, Math.max(8, scene2Target - SCENE2_FIXED));

  // Scene 3+4: animation (39) + afterGreenPause (padding) + allSettledHold (padding)
  const totalScene34Padding = Math.max(14, scene34Target - SCENE34_FIXED);
  const afterGreenPause = 6;
  const allSettledHold = Math.min(60, Math.max(45, totalScene34Padding - afterGreenPause));

  // Scene 5: animation (10) + ctaHold (padding)
  const ctaHold = Math.min(75, Math.max(20, scene5Target - SCENE5_FIXED));

  return {
    emptyDashboard,
    fullListHold,
    sceneSwitch,
    afterTransfersHold,
    afterGreenPause,
    allSettledHold,
    ctaHold,
  };
}

/**
 * Generate TTS voiceover for a category and return line durations
 */
async function generateVoiceover(category, tempDir) {
  const lines = SCRIPTS[category] || SCRIPTS.generic;
  const audioFiles = [];
  const lineDurations = [];

  for (let i = 0; i < lines.length; i++) {
    const audioPath = path.join(tempDir, `line-${i}.mp3`);
    console.log(`      TTS: "${lines[i]}"`);

    try {
      await generateTTS(lines[i], audioPath, VOICES.JESSIE);
    } catch {
      console.log(`      ⚠️ TTS failed, creating silence`);
      await execAsync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 2 "${audioPath}"`);
    }

    // Trim leading + trailing silence and convert to WAV (avoids MP3 frame padding)
    const wavPath = path.join(tempDir, `line-${i}.wav`);
    await execAsync(
      `ffmpeg -y -i "${audioPath}" -af "silenceremove=start_periods=1:start_threshold=-40dB:start_duration=0.02,areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_duration=0.02,areverse" -ar 44100 "${wavPath}"`
    );
    audioFiles.push(wavPath);

    // Measure actual duration (after trimming)
    const { stdout } = await execAsync(
      `ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`
    );
    lineDurations.push(parseFloat(stdout.trim()));

    // Small delay between TTS calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  // Log line durations for debugging
  console.log(`      Line durations: ${lineDurations.map((d, i) => `L${i}=${d.toFixed(2)}s`).join(", ")}`);
  console.log(`      Total voice: ${lineDurations.reduce((a, b) => a + b, 0).toFixed(2)}s`);

  // Build voiceover with scene-aware gaps (WAV for clean boundaries)
  const listFile = path.join(tempDir, "audio-list.txt");
  // Gap between lines 0-1 is 0.25s (same scene), others 0.35s (scene transitions)
  const gaps = [0.25, 0.35, 0.35, 0.35]; // gaps AFTER lines 0,1,2,3

  let listContent = "";
  for (let i = 0; i < audioFiles.length; i++) {
    listContent += `file '${audioFiles[i]}'\n`;
    if (i < gaps.length) {
      const gapPath = path.join(tempDir, `gap-${i}.wav`);
      await execAsync(
        `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${gaps[i]} "${gapPath}"`
      );
      listContent += `file '${gapPath}'\n`;
    }
  }
  fs.writeFileSync(listFile, listContent);

  const outputAudio = path.join(tempDir, "voiceover.mp3");
  await execAsync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -acodec libmp3lame -ar 44100 "${outputAudio}"`);

  return { voiceoverPath: outputAudio, lineDurations };
}

/**
 * Stitch everything together: source clip + demo + voiceover
 */
async function createFinalVideo(stitchClip, demoPath, voiceoverPath, outputPath, tempDir) {
  // We need to re-encode to ensure compatibility
  const stitchReencoded = path.join(tempDir, "stitch-reencoded.mp4");
  const demoReencoded = path.join(tempDir, "demo-reencoded.mp4");

  // Re-encode both to same format
  await execAsync(
    `ffmpeg -y -i "${stitchClip}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 18 -c:a aac -ar 44100 -r 30 "${stitchReencoded}"`
  );

  const concatenatedVideo = path.join(tempDir, "concatenated.mp4");

  if (fs.existsSync(demoPath)) {
    await execAsync(
      `ffmpeg -y -i "${demoPath}" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 18 -c:a aac -ar 44100 -r 30 -shortest "${demoReencoded}"`
    );

    // Use xfade for video crossfade and acrossfade for audio crossfade
    // Crossfade starts 0.5s before the stitch clip ends
    const xfadeOffset = STITCH_DURATION - CROSSFADE_DURATION;
    await execAsync(
      `ffmpeg -y -i "${stitchReencoded}" -i "${demoReencoded}" -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${CROSSFADE_DURATION}:offset=${xfadeOffset}[v];[0:a][1:a]acrossfade=d=${CROSSFADE_DURATION}[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac "${concatenatedVideo}"`
    );
  } else {
    // If no demo exists, just use the stitch clip
    await execAsync(`ffmpeg -y -i "${stitchReencoded}" -c copy "${concatenatedVideo}"`);
  }

  // Delay voiceover to start AFTER the hook clip, accounting for crossfade overlap
  // The demo now starts 0.5s earlier due to crossfade, so we delay less
  const voiceoverDelay = STITCH_DURATION - CROSSFADE_DURATION;
  const delaySilence = path.join(tempDir, "delay-silence.mp3");
  const delayedVoiceover = path.join(tempDir, "voiceover-delayed.mp3");
  const delayListFile = path.join(tempDir, "delay-list.txt");

  await execAsync(
    `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${voiceoverDelay} -acodec libmp3lame "${delaySilence}"`
  );
  fs.writeFileSync(delayListFile, `file '${delaySilence}'\nfile '${voiceoverPath}'`);
  await execAsync(`ffmpeg -y -f concat -safe 0 -i "${delayListFile}" -c copy "${delayedVoiceover}"`);

  // Mix: original audio at 30% + delayed voiceover at 100%
  await execAsync(
    `ffmpeg -y -i "${concatenatedVideo}" -i "${delayedVoiceover}" -filter_complex "[0:a]volume=0.3[a1];[1:a]volume=1.0[a2];[a1][a2]amix=inputs=2:duration=longest[a]" -map 0:v -map "[a]" -c:v copy -c:a aac "${outputPath}"`
  );

  return outputPath;
}

/**
 * Main generation pipeline
 */
async function generateVideos() {
  console.log("🎬 PartyTab Video Generator - Full Pipeline\n");

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
        const category = await categorizeVideo(inputVideo);
        const template = getTemplate(category);
        console.log(`    → ${template.name} ${template.emoji}`);

        // 2. Extract stitch clip
        console.log("    Step 2: Extracting stitch clip...");
        const stitchClip = path.join(videoTempDir, "stitch.mp4");
        await extractStitchClip(inputVideo, stitchClip, STITCH_DURATION);

        // 3. Generate voiceover (first, to get timing)
        console.log("    Step 3: Generating voiceover...");
        const { voiceoverPath, lineDurations } = await generateVoiceover(category, videoTempDir);
        const scenePadding = calculateScenePadding(lineDurations);

        // 4. Record PartyTab demo (synced to voiceover timing)
        console.log("    Step 4: Recording PartyTab demo...");
        const demoPath = path.join(videoTempDir, "demo.mp4");
        await recordDemo(category, demoPath, scenePadding);

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
