/**
 * PartyTab Demo Recorder
 * Uses Puppeteer to automate PartyTab and record screen captures
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

const PARTYTAB_URL = "https://partytab.app";
const VIEWPORT = { width: 390, height: 844 }; // iPhone-like dimensions for TikTok

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Record a PartyTab demo for a specific trip category
 */
export async function recordDemo(category, outputPath) {
  const template = getTemplate(category);
  const tempDir = path.join(__dirname, "..", "temp", `demo-${Date.now()}`);
  const framesDir = path.join(tempDir, "frames");

  // Create temp directories
  fs.mkdirSync(framesDir, { recursive: true });

  console.log(`  🎬 Recording demo for: ${template.name} ${template.emoji}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  let frameCount = 0;
  const captureFrame = async () => {
    const framePath = path.join(framesDir, `frame-${frameCount.toString().padStart(5, "0")}.png`);
    await page.screenshot({ path: framePath });
    frameCount++;
  };

  // Start capturing frames at ~15fps during interactions
  const captureInterval = setInterval(captureFrame, 66); // ~15fps

  try {
    // Navigate to PartyTab
    console.log("    → Opening PartyTab...");
    await page.goto(PARTYTAB_URL, { waitUntil: "networkidle2" });
    await sleep(1000);

    // Enter tab name and create
    console.log(`    → Creating tab: ${template.name} ${template.emoji}`);

    // Find the name input and type the tab name
    const nameInput = await page.$('input[placeholder*="Name your trip"]')
      || await page.$('input[type="text"]');

    if (nameInput) {
      await nameInput.click();
      await page.keyboard.type(`${template.name} ${template.emoji}`, { delay: 50 });
      await sleep(500);
    }

    // Click "Start Tab" button
    const startButton = await page.$('button:has-text("Start Tab")')
      || await page.$('button[type="submit"]')
      || await page.$('button');

    if (startButton) {
      await startButton.click();
      await sleep(1500);
    }

    // Add expenses
    console.log("    → Adding expenses...");
    for (const expense of template.expenses) {
      await sleep(800);

      // Look for "Add Expense" button
      await page.$$eval('button', buttons => {
        const btn = buttons.find(b =>
          b.textContent.toLowerCase().includes('add') ||
          b.textContent.includes('+')
        );
        return btn ? true : false;
      });

      // Click add expense
      await page.click('button:has-text("Add"), button:has-text("+"), [data-testid="add-expense"]').catch(() => { });
      await sleep(500);

      // Fill in expense details (adjust selectors based on actual PartyTab UI)
      // Description
      const descInput = await page.$('input[placeholder*="description"], input[placeholder*="What"], input[name="description"]');
      if (descInput) {
        await descInput.type(expense.description, { delay: 30 });
      }

      // Amount
      const amountInput = await page.$('input[type="number"], input[placeholder*="amount"], input[name="amount"]');
      if (amountInput) {
        await amountInput.type(expense.amount.toString(), { delay: 30 });
      }

      // Select who paid (this will depend on PartyTab's actual UI)
      // For now, we'll try clicking on the payer name if visible
      await page.click(`text=${expense.paidBy}`).catch(() => { });

      // Submit/save the expense
      await page.click('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').catch(() => { });
      await sleep(500);

      console.log(`      + ${expense.description}: $${expense.amount} (${expense.paidBy})`);
    }

    // Navigate to settlement view
    console.log("    → Showing settlement...");
    await sleep(1000);

    // Look for settle up / summary button
    await page.click('button:has-text("Settle"), button:has-text("Summary"), a:has-text("Settle")').catch(() => { });
    await sleep(2000);

    // Final pause on settlement screen
    await sleep(1500);

  } catch (error) {
    console.error("    ❌ Recording error:", error.message);
  }

  // Stop capturing
  clearInterval(captureInterval);
  await browser.close();

  // Convert frames to video using ffmpeg
  console.log("    → Encoding video...");

  if (frameCount > 0) {
    try {
      await execAsync(
        `ffmpeg -y -framerate 15 -i "${framesDir}/frame-%05d.png" -c:v libx264 -pix_fmt yuv420p -r 30 "${outputPath}"`
      );
      console.log(`    ✅ Demo saved: ${path.basename(outputPath)}`);
    } catch (error) {
      console.error("    ❌ Encoding error:", error.message);
    }
  }

  // Cleanup temp files
  fs.rmSync(tempDir, { recursive: true, force: true });

  return outputPath;
}

/**
 * Record demos for all categories (for pre-generation)
 */
export async function recordAllDemos(outputDir) {
  const categories = ["ski", "beach", "bachelor", "bachelorette", "roadtrip", "camping", "lake", "city", "vegas", "hiking", "generic"];

  for (const category of categories) {
    const outputPath = path.join(outputDir, `demo-${category}.mp4`);
    await recordDemo(category, outputPath);
    await sleep(1000); // Brief pause between recordings
  }
}

// CLI usage
if (process.argv[1].includes("record-demo")) {
  const category = process.argv[2] || "generic";
  const outputPath = process.argv[3] || path.join(__dirname, "..", "assets", `demo-${category}.mp4`);

  // Ensure output directory exists
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
