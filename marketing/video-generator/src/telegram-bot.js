import TelegramBot from 'node-telegram-bot-api';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const execAsync = promisify(exec);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_ID = parseInt(process.env.TELEGRAM_USER_ID);
const INPUT_DIR = path.join(__dirname, '..', 'input');

// Ensure input directory exists
if (!fs.existsSync(INPUT_DIR)) {
  fs.mkdirSync(INPUT_DIR, { recursive: true });
}

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 PartyTab TikTok Collector Bot is running...');
console.log(`📁 Saving videos to: ${INPUT_DIR}`);

// Security: Only respond to your messages
function isAuthorized(msg) {
  if (msg.from.id !== ALLOWED_USER_ID) {
    console.log(`⚠️ Unauthorized access attempt from user ${msg.from.id}`);
    return false;
  }
  return true;
}

// Extract TikTok URL from message
function extractTikTokUrl(text) {
  // Match various TikTok URL formats
  const patterns = [
    /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/gi,
    /https?:\/\/(?:vm|vt)\.tiktok\.com\/[\w]+/gi,
    /https?:\/\/(?:www\.)?tiktok\.com\/t\/[\w]+/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

// Download TikTok video using yt-dlp
async function downloadTikTok(url, outputPath) {
  try {
    // yt-dlp command to download without watermark
    const command = `yt-dlp -o "${outputPath}" --no-watermark "${url}"`;
    await execAsync(command);
    return true;
  } catch (error) {
    console.error('Download error:', error.message);
    // Try alternative method
    try {
      const command = `yt-dlp -o "${outputPath}" "${url}"`;
      await execAsync(command);
      return true;
    } catch (err) {
      console.error('Alternative download also failed:', err.message);
      return false;
    }
  }
}

// Generate unique filename with timestamp
function generateFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `tiktok-${timestamp}.mp4`;
}

// Count videos in input folder
function getVideoCount() {
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.mp4'));
  return files.length;
}

// Handle /start command
bot.onText(/\/start/, (msg) => {
  if (!isAuthorized(msg)) return;

  bot.sendMessage(msg.chat.id,
    `👋 Hey! I'm the PartyTab Video Collector.\n\n` +
    `Share TikTok links with me and I'll save them for video generation.\n\n` +
    `Commands:\n` +
    `/status - See how many clips are queued\n` +
    `/list - List all queued clips\n` +
    `/clear - Clear all queued clips\n\n` +
    `Just share a TikTok link to get started!`
  );
});

// Handle /status command
bot.onText(/\/status/, (msg) => {
  if (!isAuthorized(msg)) return;

  const count = getVideoCount();
  bot.sendMessage(msg.chat.id, `📊 You have ${count} video(s) queued for processing.`);
});

// Handle /list command
bot.onText(/\/list/, (msg) => {
  if (!isAuthorized(msg)) return;

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.mp4'));

  if (files.length === 0) {
    bot.sendMessage(msg.chat.id, '📭 No videos queued yet. Share some TikTok links!');
    return;
  }

  const list = files.map((f, i) => `${i + 1}. ${f}`).join('\n');
  bot.sendMessage(msg.chat.id, `📋 Queued videos:\n\n${list}`);
});

// Handle /clear command
bot.onText(/\/clear/, (msg) => {
  if (!isAuthorized(msg)) return;

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.mp4'));
  files.forEach(f => fs.unlinkSync(path.join(INPUT_DIR, f)));

  bot.sendMessage(msg.chat.id, `🗑️ Cleared ${files.length} video(s) from the queue.`);
});

// Handle incoming messages (TikTok links)
bot.on('message', async (msg) => {
  if (!isAuthorized(msg)) return;

  // Skip commands
  if (msg.text && msg.text.startsWith('/')) return;

  const text = msg.text || '';
  const url = extractTikTokUrl(text);

  if (!url) {
    // Check if it's a shared video directly
    if (msg.video) {
      const filename = generateFilename();
      const outputPath = path.join(INPUT_DIR, filename);

      try {
        const fileId = msg.video.file_id;
        const fileLink = await bot.getFileLink(fileId);

        // Download using curl or wget
        await execAsync(`curl -L -o "${outputPath}" "${fileLink}"`);

        const count = getVideoCount();
        bot.sendMessage(msg.chat.id, `✅ Video saved!\n📁 Total queued: ${count}`);
      } catch (error) {
        bot.sendMessage(msg.chat.id, `❌ Failed to save video: ${error.message}`);
      }
      return;
    }

    // Not a TikTok link or video
    if (text.trim()) {
      bot.sendMessage(msg.chat.id,
        `🤔 I don't see a TikTok link there.\n\nShare a TikTok video link or forward a video directly.`
      );
    }
    return;
  }

  // Found a TikTok URL - download it
  const statusMsg = await bot.sendMessage(msg.chat.id, '⏳ Downloading video...');

  const filename = generateFilename();
  const outputPath = path.join(INPUT_DIR, filename);

  const success = await downloadTikTok(url, outputPath);

  if (success && fs.existsSync(outputPath)) {
    const count = getVideoCount();
    bot.editMessageText(
      `✅ Video saved!\n📁 Total queued: ${count}`,
      { chat_id: msg.chat.id, message_id: statusMsg.message_id }
    );
  } else {
    bot.editMessageText(
      `❌ Failed to download. Try sharing the video directly instead of the link.`,
      { chat_id: msg.chat.id, message_id: statusMsg.message_id }
    );
  }
});

// Handle errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

console.log('✅ Bot is ready! Share TikTok links in your chat with @PartyTab_TokBot');
