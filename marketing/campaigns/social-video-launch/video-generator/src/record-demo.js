/**
 * PartyTab Demo Recorder
 *
 * Renders a local HTML clone of the PartyTab UI with themed trip data,
 * captures screenshots at each animation step, and encodes to video via FFmpeg.
 *
 * No dependency on the live PartyTab site — fully self-contained.
 */

import puppeteer from "puppeteer";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getTemplate } from "./trip-templates.js";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_PATH = path.join(__dirname, "..", "assets", "demo-template.html");
const VIEWPORT = { width: 360, height: 640, deviceScaleFactor: 3 }; // 3x DPR → 1080×1920 TikTok HD
const FPS = 30;

// Timing (in frames at 30fps) — tuned for TikTok (~10s demo)
const HOLD_FRAMES = 8;            // ~0.27s hold on each new expense
const EXPENSE_PAUSE = 3;          // ~0.10s between expenses
const SCENE_TRANSITION = 8;       // ~0.27s pause between scenes
const TRANSFER_HOLD = 6;          // ~0.20s per transfer reveal
const FINAL_HOLD = 110;           // ~3.67s hold on CTA — voice finishes over it

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capture N identical frames of the current page state
 */
async function captureFrames(page, framesDir, startFrame, count) {
  // Take one screenshot and duplicate it for the hold duration
  const framePath = path.join(framesDir, `frame-${startFrame.toString().padStart(5, "0")}.png`);
  await page.screenshot({ path: framePath });

  // Copy the same image for subsequent hold frames
  for (let i = 1; i < count; i++) {
    const destPath = path.join(framesDir, `frame-${(startFrame + i).toString().padStart(5, "0")}.png`);
    fs.copyFileSync(framePath, destPath);
  }

  return startFrame + count;
}

/**
 * Record a PartyTab demo for a specific trip category
 */
export async function recordDemo(category, outputPath, scenePadding = null) {
  const template = getTemplate(category);
  const tempDir = path.join(__dirname, "..", "temp", `demo-${Date.now()}`);
  const framesDir = path.join(tempDir, "frames");

  fs.mkdirSync(framesDir, { recursive: true });

  console.log(`  🎬 Recording demo for: ${template.name} ${template.emoji}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Load the local HTML template
  const templateUrl = `file://${TEMPLATE_PATH}`;
  await page.goto(templateUrl, { waitUntil: "networkidle0" });

  // Inject the trip data
  const demoData = {
    tabName: `${template.name} ${template.emoji}`,
    expenses: template.expenses,
    participants: [...new Set(template.expenses.map((e) => e.paidBy))],
  };

  await page.evaluate((data) => {
    window.DEMO_DATA = data;
  }, demoData);

  let frame = 0;

  try {
    // === Scene 1: Dashboard with expenses appearing one by one ===
    console.log("    → Scene 1: Dashboard + expenses");

    // Initialize dashboard
    await page.evaluate(() => window.showDashboard());
    await sleep(100); // Let the DOM update

    // Brief flash of empty dashboard
    frame = await captureFrames(page, framesDir, frame, scenePadding?.emptyDashboard ?? SCENE_TRANSITION);

    // Reveal each expense one by one
    for (let i = 0; i < template.expenses.length; i++) {
      await page.evaluate((idx) => window.showExpense(idx), i);
      await sleep(60); // Let CSS transition start

      // Capture the transition (snappy for TikTok)
      for (let t = 0; t < 5; t++) {
        const framePath = path.join(framesDir, `frame-${frame.toString().padStart(5, "0")}.png`);
        await page.screenshot({ path: framePath });
        frame++;
        await sleep(20);
      }

      // Hold on the new state
      frame = await captureFrames(page, framesDir, frame, HOLD_FRAMES);

      // Brief pause before next expense
      if (i < template.expenses.length - 1) {
        frame = await captureFrames(page, framesDir, frame, EXPENSE_PAUSE);
      }
    }

    // Hold on the full expense list
    frame = await captureFrames(page, framesDir, frame, scenePadding?.fullListHold ?? SCENE_TRANSITION);

    // === Scene 2: Settlement view ===
    console.log("    → Scene 2: Settlement");

    await page.evaluate(() => window.showSettlement());
    await sleep(100);

    // Quick scene switch
    frame = await captureFrames(page, framesDir, frame, scenePadding?.sceneSwitch ?? 2);

    // Reveal the settlement banner
    await page.evaluate(() => window.showSettleBanner());
    await sleep(60);
    for (let t = 0; t < 6; t++) {
      const framePath = path.join(framesDir, `frame-${frame.toString().padStart(5, "0")}.png`);
      await page.screenshot({ path: framePath });
      frame++;
      await sleep(20);
    }
    frame = await captureFrames(page, framesDir, frame, HOLD_FRAMES);

    // Reveal each transfer
    const transferCount = await page.evaluate(() => {
      return document.querySelectorAll('.transfer-item').length;
    });

    for (let i = 0; i < transferCount; i++) {
      await page.evaluate((idx) => window.showTransfer(idx), i);
      await sleep(60);

      for (let t = 0; t < 5; t++) {
        const framePath = path.join(framesDir, `frame-${frame.toString().padStart(5, "0")}.png`);
        await page.screenshot({ path: framePath });
        frame++;
        await sleep(20);
      }

      frame = await captureFrames(page, framesDir, frame, TRANSFER_HOLD);
    }

    // Hold on all transfers visible
    frame = await captureFrames(page, framesDir, frame, scenePadding?.afterTransfersHold ?? SCENE_TRANSITION);

    // === Scene 3: Transfers completing one by one ===
    console.log("    → Scene 3: Settling transfers");

    for (let i = 0; i < transferCount; i++) {
      await page.evaluate((idx) => window.completeTransfer(idx), i);
      await sleep(60);

      // Capture the green flip transition
      for (let t = 0; t < 5; t++) {
        const framePath = path.join(framesDir, `frame-${frame.toString().padStart(5, "0")}.png`);
        await page.screenshot({ path: framePath });
        frame++;
        await sleep(20);
      }

      frame = await captureFrames(page, framesDir, frame, TRANSFER_HOLD);
    }

    // Brief pause with all transfers green
    frame = await captureFrames(page, framesDir, frame, scenePadding?.afterGreenPause ?? 6);

    // Show the "All settled!" banner
    console.log("    → Scene 4: All settled!");
    await page.evaluate(() => window.showAllSettled());
    await sleep(60);

    for (let t = 0; t < 6; t++) {
      const framePath = path.join(framesDir, `frame-${frame.toString().padStart(5, "0")}.png`);
      await page.screenshot({ path: framePath });
      frame++;
      await sleep(20);
    }

    // Hold on the "All settled" view
    frame = await captureFrames(page, framesDir, frame, scenePadding?.allSettledHold ?? SCENE_TRANSITION);

    // === Scene 5: CTA end screen ===
    console.log("    → Scene 5: PartyTab.app CTA");
    await page.evaluate(() => window.showCTA());
    await sleep(80);

    // Capture the fade-in
    for (let t = 0; t < 10; t++) {
      const framePath = path.join(framesDir, `frame-${frame.toString().padStart(5, "0")}.png`);
      await page.screenshot({ path: framePath });
      frame++;
      await sleep(30);
    }

    // Hold on the CTA screen
    frame = await captureFrames(page, framesDir, frame, scenePadding?.ctaHold ?? FINAL_HOLD);

  } catch (error) {
    console.error("    ❌ Recording error:", error.message);
  }

  await browser.close();

  // Encode frames to video
  console.log(`    → Encoding ${frame} frames to video...`);

  if (frame > 0) {
    try {
      await execAsync(
        `ffmpeg -y -framerate ${FPS} -i "${framesDir}/frame-%05d.png" -c:v libx264 -crf 18 -pix_fmt yuv420p -r ${FPS} "${outputPath}"`
      );
      console.log(`    ✅ Demo saved: ${path.basename(outputPath)} (${(frame / FPS).toFixed(1)}s)`);
    } catch (error) {
      console.error("    ❌ Encoding error:", error.message);
    }
  }

  // Cleanup temp frames
  fs.rmSync(tempDir, { recursive: true, force: true });

  return outputPath;
}

/**
 * Record demos for all categories (for pre-generation)
 */
export async function recordAllDemos(outputDir) {
  const categories = [
    "ski", "beach", "bachelor", "bachelorette", "roadtrip",
    "camping", "lake", "city", "vegas", "hiking", "generic",
  ];

  for (const category of categories) {
    const outputPath = path.join(outputDir, `demo-${category}.mp4`);
    await recordDemo(category, outputPath);
    await sleep(500);
  }
}

// CLI usage
if (process.argv[1].includes("record-demo")) {
  const category = process.argv[2] || "generic";
  const outputPath = process.argv[3] || path.join(__dirname, "..", "assets", `demo-${category}.mp4`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  recordDemo(category, outputPath)
    .then(() => {
      console.log("\n✅ Demo recording complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error);
      process.exit(1);
    });
}
