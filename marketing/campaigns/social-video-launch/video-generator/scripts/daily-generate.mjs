#!/usr/bin/env node
/**
 * Daily video generator — run by launchd once per day
 * Processes any new TikToks in input/ and moves them to input/processed/
 *
 * This is a Node.js equivalent of daily-generate.sh, needed because macOS TCC
 * blocks /bin/bash from accessing ~/Desktop/ when launched by launchd, but
 * /usr/local/bin/node has the necessary access.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.join(__dirname, "..");
const INPUT_DIR = path.join(PROJECT_DIR, "input");
const OUTPUT_DIR = path.join(PROJECT_DIR, "output");
const PROCESSED_DIR = path.join(INPUT_DIR, "processed");
const LOG_FILE = path.join(PROJECT_DIR, "logs", "daily-generate.log");

// Ensure dirs exist
fs.mkdirSync(PROCESSED_DIR, { recursive: true });
fs.mkdirSync(path.join(PROJECT_DIR, "logs"), { recursive: true });

function log(msg) {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const line = `[${timestamp}] ${msg}\n`;
  process.stdout.write(line);
  fs.appendFileSync(LOG_FILE, line);
}

// Count unprocessed videos
const videos = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith(".mp4"));

if (videos.length === 0) {
  log("No new videos to process. Exiting.");
  process.exit(0);
}

log(`Found ${videos.length} new video(s) to process.`);

// Find the latest date from existing output filenames (e.g. 2026-02-15-sun.mp4)
let latestDate = "";
if (fs.existsSync(OUTPUT_DIR)) {
  for (const dir of fs.readdirSync(OUTPUT_DIR)) {
    const weekPath = path.join(OUTPUT_DIR, dir);
    if (!fs.statSync(weekPath).isDirectory()) continue;
    for (const file of fs.readdirSync(weekPath)) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match && match[1] > latestDate) {
        latestDate = match[1];
      }
    }
  }
}

let startDate;
if (latestDate) {
  // Advance one day from the latest existing output
  const d = new Date(latestDate + "T12:00:00");
  d.setDate(d.getDate() + 1);
  startDate = d.toISOString().split("T")[0];
  log(`Continuing from ${latestDate} → starting at ${startDate}`);
} else {
  startDate = new Date().toISOString().split("T")[0];
  log(`No existing output. Starting from today: ${startDate}`);
}

// Run the pipeline
log("Running video generator...");
const logFd = fs.openSync(LOG_FILE, "a");
try {
  execFileSync("node", ["src/generate-videos.js"], {
    cwd: PROJECT_DIR,
    env: { ...process.env, START_DATE: startDate },
    stdio: ["ignore", logFd, logFd],
    timeout: 30 * 60 * 1000, // 30 minute max
  });
  log("Pipeline completed successfully.");

  // Move processed input videos to processed/
  for (const mp4 of videos) {
    const mp4Path = path.join(INPUT_DIR, mp4);
    fs.renameSync(mp4Path, path.join(PROCESSED_DIR, mp4));

    // Also move associated metadata files
    for (const ext of ["info.json", "category.json"]) {
      const metaFile = mp4Path.replace(".mp4", `.${ext}`);
      if (fs.existsSync(metaFile)) {
        fs.renameSync(
          metaFile,
          path.join(PROCESSED_DIR, mp4.replace(".mp4", `.${ext}`))
        );
      }
    }
    log(`  Archived: ${mp4}`);
  }

  log("All videos archived to input/processed/");
} catch (error) {
  log(`Pipeline failed! ${error.message}`);
  log("Input videos left in place for retry.");
  process.exit(1);
} finally {
  fs.closeSync(logFd);
}
