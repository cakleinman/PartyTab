/**
 * Video Categorization using Ollama + LLaVA
 * Analyzes video frames to determine trip type
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { CATEGORY_KEYWORDS } from "./trip-templates.js";

const execAsync = promisify(exec);

// Available categories for the AI to choose from
const CATEGORIES = Object.keys(CATEGORY_KEYWORDS);

/**
 * Extract a frame from video at given timestamp
 */
async function extractFrame(videoPath, outputPath, timestamp = "00:00:01") {
  await execAsync(
    `ffmpeg -y -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${outputPath}"`
  );
  return outputPath;
}

/**
 * Extract multiple frames for better analysis
 */
async function extractFrames(videoPath, tempDir, count = 3) {
  const frames = [];

  // Get video duration
  let duration = 10;
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    duration = Math.min(parseFloat(stdout.trim()), 30); // Cap at 30 seconds
  } catch {
    // Use default
  }

  // Extract frames at different points
  const timestamps = [];
  for (let i = 0; i < count; i++) {
    const time = Math.floor((duration / (count + 1)) * (i + 1));
    timestamps.push(time);
  }

  for (let i = 0; i < timestamps.length; i++) {
    const framePath = path.join(tempDir, `frame-${i}.jpg`);
    const timestamp = `00:00:${timestamps[i].toString().padStart(2, "0")}`;
    try {
      await extractFrame(videoPath, framePath, timestamp);
      frames.push(framePath);
    } catch {
      console.error(`Failed to extract frame at ${timestamp}`);
    }
  }

  return frames;
}

/**
 * Analyze image using Ollama with LLaVA model
 */
async function analyzeWithOllama(imagePath) {
  const prompt = `Look at this image and determine what type of group trip or vacation it shows.
Choose exactly ONE category from this list: ${CATEGORIES.join(", ")}, generic

Just respond with the single category word, nothing else.

Examples:
- Snow, skiing, mountains → ski
- Beach, ocean, sand → beach
- Group of guys partying → bachelor
- Group of women celebrating → bachelorette
- Las Vegas, casinos → vegas
- Hiking trails, nature → hiking
- Lake, boats, fishing → lake
- City skyline, urban → city
- Tents, campfire → camping
- Car journey, highway → roadtrip

If you're unsure, respond with: generic`;

  try {
    // Convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Call Ollama API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llava",
        prompt: prompt,
        images: [base64Image],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.response.trim().toLowerCase();

    // Validate it's a known category
    if (CATEGORIES.includes(result)) {
      return result;
    }

    // Try to extract category from response
    for (const category of CATEGORIES) {
      if (result.includes(category)) {
        return category;
      }
    }

    return "generic";
  } catch (error) {
    console.error("Ollama analysis error:", error.message);
    return null;
  }
}

/**
 * Check if Ollama is running and has LLaVA model
 */
async function checkOllama() {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    if (!response.ok) return { running: false, hasLlava: false };

    const data = await response.json();
    const models = data.models || [];
    const hasLlava = models.some((m) => m.name.includes("llava"));

    return { running: true, hasLlava };
  } catch {
    return { running: false, hasLlava: false };
  }
}

/**
 * Main categorization function
 */
export async function categorizeVideo(videoPath, tempDir) {
  console.log(`  🔍 Analyzing video: ${path.basename(videoPath)}`);

  // Check Ollama status
  const ollamaStatus = await checkOllama();

  if (!ollamaStatus.running) {
    console.log("  ⚠️ Ollama not running. Using fallback: generic");
    return "generic";
  }

  if (!ollamaStatus.hasLlava) {
    console.log("  ⚠️ LLaVA model not found. Using fallback: generic");
    console.log('  💡 Run: ollama pull llava');
    return "generic";
  }

  // Extract frames
  const frames = await extractFrames(videoPath, tempDir);

  if (frames.length === 0) {
    console.log("  ⚠️ Could not extract frames. Using fallback: generic");
    return "generic";
  }

  // Analyze each frame and vote
  const votes = {};

  for (const frame of frames) {
    const category = await analyzeWithOllama(frame);
    if (category) {
      votes[category] = (votes[category] || 0) + 1;
    }
  }

  // Find winning category
  let winner = "generic";
  let maxVotes = 0;

  for (const [category, count] of Object.entries(votes)) {
    if (count > maxVotes) {
      maxVotes = count;
      winner = category;
    }
  }

  console.log(`  ✅ Detected category: ${winner}`);
  return winner;
}

/**
 * Simple fallback using filename/metadata
 */
export function categorizeByFilename(filename) {
  const lower = filename.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }

  return "generic";
}

export { checkOllama, CATEGORIES };
