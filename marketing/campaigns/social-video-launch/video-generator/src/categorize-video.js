/**
 * Video Categorization using TikTok metadata + visual AI analysis
 *
 * Priority:
 * 1. Manual category from .category.json (confirmed by user in Telegram)
 * 2. Auto-detect from TikTok metadata (.info.json)
 * 3. Visual content analysis via Claude Haiku (looks at a video frame)
 * 4. Filename-based fallback
 * 5. "generic" default
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { matchCategoryFromText, CATEGORY_KEYWORDS, TRIP_TEMPLATES } from "./trip-templates.js";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load video generator .env, then fall back to main project .env for ANTHROPIC_API_KEY
dotenv.config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.ANTHROPIC_API_KEY) {
  dotenv.config({ path: path.join(__dirname, "..", "..", "..", "..", "..", ".env") });
}

// Available categories
const CATEGORIES = Object.keys(CATEGORY_KEYWORDS);

/**
 * Read the manually-confirmed category from .category.json (saved by the Telegram bot)
 */
function readManualCategory(videoPath) {
  const manifestPath = videoPath.replace(/\.mp4$/, ".category.json");
  if (!fs.existsSync(manifestPath)) return null;

  try {
    const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (data.category && CATEGORIES.includes(data.category)) {
      return data.category;
    }
    // Also accept "generic"
    if (data.category === "generic") return "generic";
  } catch {
    // ignore
  }
  return null;
}

/**
 * Read TikTok metadata from .info.json (saved by yt-dlp)
 */
function readTikTokMetadata(videoPath) {
  const infoPath = videoPath.replace(/\.mp4$/, ".info.json");
  if (!fs.existsSync(infoPath)) return null;

  try {
    const raw = fs.readFileSync(infoPath, "utf-8");
    const data = JSON.parse(raw);
    return {
      description: data.description || "",
      title: data.title || "",
      tags: data.tags || [],
      uploader: data.uploader || "",
      hashtags: (data.description || "").match(/#\w+/g) || [],
    };
  } catch {
    return null;
  }
}

/**
 * Categorize from TikTok metadata (description, hashtags, tags)
 */
function categorizeFromMetadata(metadata) {
  if (!metadata) return null;

  const searchText = [
    metadata.description,
    metadata.title,
    ...metadata.tags,
    ...metadata.hashtags,
  ].join(" ");

  const result = matchCategoryFromText(searchText);
  // Only return if we got a real match (not generic fallback from no matches)
  return result !== "generic" ? result : null;
}

/**
 * Classify video content visually using Claude Haiku
 * Extracts a frame from the video and asks Claude to identify the trip type
 */
async function categorizeFromVisualContent(videoPath) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const framePath = videoPath.replace(/\.mp4$/, "-classify-frame.png");

  try {
    // Extract a frame from 1.5s into the video (past any intro)
    await execAsync(
      `ffmpeg -y -ss 1.5 -i "${videoPath}" -frames:v 1 -q:v 2 "${framePath}"`
    );

    const imageData = fs.readFileSync(framePath).toString("base64");
    fs.unlinkSync(framePath);

    const categoryList = Object.entries(TRIP_TEMPLATES)
      .filter(([key]) => key !== "generic")
      .map(([key, val]) => `${key} (${val.name})`)
      .join(", ");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20241022",
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/png", data: imageData },
              },
              {
                type: "text",
                text: `This is a frame from a TikTok video about a group activity or trip. Based on the visual content, classify it into exactly ONE of these categories: ${categoryList}, generic. If it doesn't clearly match any specific category, reply "generic". Reply with ONLY the category key (e.g. "ski", "beach", "generic"), nothing else.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) return null;

    const result = await response.json();
    const category = result.content?.[0]?.text?.trim()?.toLowerCase();

    if (category && (CATEGORIES.includes(category) || category === "generic")) {
      return category;
    }
  } catch (error) {
    // Clean up frame file if it exists
    if (fs.existsSync(framePath)) fs.unlinkSync(framePath);
    console.log(`  ⚠️ Visual classification failed: ${error.message}`);
  }

  return null;
}

/**
 * Simple fallback using filename
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

/**
 * Main categorization function
 *
 * Priority:
 * 1. Manual category from .category.json (confirmed by user in Telegram)
 * 2. Auto-detect from TikTok metadata (.info.json)
 * 3. Filename-based fallback
 * 4. "generic" default
 */
export async function categorizeVideo(videoPath) {
  console.log(`  🔍 Categorizing: ${path.basename(videoPath)}`);

  // 1. Check for manual override (user confirmed via Telegram bot)
  const manual = readManualCategory(videoPath);
  if (manual) {
    console.log(`  ✅ Category (confirmed): ${manual}`);
    return manual;
  }

  // 2. Try TikTok metadata
  const metadata = readTikTokMetadata(videoPath);
  const fromMetadata = categorizeFromMetadata(metadata);
  if (fromMetadata) {
    console.log(`  ✅ Category (from metadata): ${fromMetadata}`);
    return fromMetadata;
  }

  // 3. Try visual content analysis via Claude
  const fromVision = await categorizeFromVisualContent(videoPath);
  if (fromVision && fromVision !== "generic") {
    console.log(`  ✅ Category (from visual analysis): ${fromVision}`);
    return fromVision;
  }

  // 4. Try filename
  const fromFilename = categorizeByFilename(path.basename(videoPath));
  if (fromFilename !== "generic") {
    console.log(`  ✅ Category (from filename): ${fromFilename}`);
    return fromFilename;
  }

  // 5. Default
  console.log("  ⚠️ No category detected, using: generic");
  return "generic";
}

export { CATEGORIES };
