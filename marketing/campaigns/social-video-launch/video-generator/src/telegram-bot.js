import TelegramBot from 'node-telegram-bot-api';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { matchCategoryFromText, CATEGORY_KEYWORDS, TRIP_TEMPLATES } from './trip-templates.js';

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

// All category keys for inline keyboard
const ALL_CATEGORIES = Object.keys(TRIP_TEMPLATES);

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

// Download TikTok video + metadata using yt-dlp
async function downloadTikTok(url, outputPath) {
  try {
    // Download video AND save metadata as .info.json
    const command = `yt-dlp -o "${outputPath}" --write-info-json --no-watermark "${url}"`;
    await execAsync(command);
    return true;
  } catch (error) {
    console.error('Download error:', error.message);
    try {
      const command = `yt-dlp -o "${outputPath}" --write-info-json "${url}"`;
      await execAsync(command);
      return true;
    } catch (err) {
      console.error('Alternative download also failed:', err.message);
      return false;
    }
  }
}

// Read TikTok metadata from .info.json
function readMetadata(videoPath) {
  // yt-dlp saves metadata as .info.json next to the video
  const infoPath = videoPath.replace(/\.mp4$/, '.info.json');
  if (!fs.existsSync(infoPath)) return null;

  try {
    const raw = fs.readFileSync(infoPath, 'utf-8');
    const data = JSON.parse(raw);
    return {
      description: data.description || '',
      title: data.title || '',
      tags: data.tags || [],
      uploader: data.uploader || '',
      hashtags: (data.description || '').match(/#\w+/g) || [],
    };
  } catch (err) {
    console.error('Failed to read metadata:', err.message);
    return null;
  }
}

// Auto-detect category from metadata
function detectCategoryFromMetadata(metadata) {
  if (!metadata) return 'generic';

  // Combine all text fields for matching
  const searchText = [
    metadata.description,
    metadata.title,
    ...metadata.tags,
    ...metadata.hashtags,
  ].join(' ');

  return matchCategoryFromText(searchText);
}

// Save the chosen category to a manifest file alongside the video
function saveCategory(videoPath, category, metadata) {
  const manifestPath = videoPath.replace(/\.mp4$/, '.category.json');
  const data = {
    category,
    metadata: metadata || null,
    confirmedAt: new Date().toISOString(),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2));
}

// Build an inline keyboard with category options, suggested one first
function buildCategoryKeyboard(suggestedCategory, videoFilename) {
  // Put the suggested category first with a checkmark
  const rows = [];
  const perRow = 3;
  let currentRow = [];

  // Add suggested category as the first button
  currentRow.push({
    text: `✅ ${TRIP_TEMPLATES[suggestedCategory]?.emoji || ''} ${suggestedCategory}`,
    callback_data: `cat:${videoFilename}:${suggestedCategory}`,
  });

  // Add the rest
  for (const cat of ALL_CATEGORIES) {
    if (cat === suggestedCategory) continue;
    currentRow.push({
      text: `${TRIP_TEMPLATES[cat]?.emoji || ''} ${cat}`,
      callback_data: `cat:${videoFilename}:${cat}`,
    });
    if (currentRow.length >= perRow) {
      rows.push(currentRow);
      currentRow = [];
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  return { inline_keyboard: rows };
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
    `I'll auto-detect the trip category from the video's tags and description, ` +
    `then ask you to confirm or pick a different one.\n\n` +
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

  // Show each video with its category
  const list = files.map((f, i) => {
    const catFile = path.join(INPUT_DIR, f.replace(/\.mp4$/, '.category.json'));
    let catLabel = '❓ uncategorized';
    if (fs.existsSync(catFile)) {
      try {
        const catData = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
        const emoji = TRIP_TEMPLATES[catData.category]?.emoji || '';
        catLabel = `${emoji} ${catData.category}`;
      } catch { /* ignore */ }
    }
    return `${i + 1}. ${f}\n   ${catLabel}`;
  }).join('\n');
  bot.sendMessage(msg.chat.id, `📋 Queued videos:\n\n${list}`);
});

// Handle /clear command
bot.onText(/\/clear/, (msg) => {
  if (!isAuthorized(msg)) return;

  const files = fs.readdirSync(INPUT_DIR);
  let cleared = 0;
  files.forEach(f => {
    if (f.endsWith('.mp4') || f.endsWith('.info.json') || f.endsWith('.category.json')) {
      fs.unlinkSync(path.join(INPUT_DIR, f));
      cleared++;
    }
  });

  bot.sendMessage(msg.chat.id, `🗑️ Cleared ${cleared} file(s) from the queue.`);
});

// Handle category selection via inline keyboard
bot.on('callback_query', async (query) => {
  const data = query.data;
  if (!data.startsWith('cat:')) return;

  const parts = data.split(':');
  const videoFilename = parts[1];
  const selectedCategory = parts[2];

  const videoPath = path.join(INPUT_DIR, videoFilename);

  // Read existing metadata if available
  const metadata = readMetadata(videoPath);

  // Save the confirmed category
  saveCategory(videoPath, selectedCategory, metadata);

  const emoji = TRIP_TEMPLATES[selectedCategory]?.emoji || '';
  const name = TRIP_TEMPLATES[selectedCategory]?.name || selectedCategory;

  await bot.answerCallbackQuery(query.id, { text: `Set to ${name}` });
  await bot.editMessageText(
    `✅ Video saved and categorized as ${emoji} ${name}!\n📁 Total queued: ${getVideoCount()}`,
    { chat_id: query.message.chat.id, message_id: query.message.message_id }
  );
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

        await execAsync(`curl -L -o "${outputPath}" "${fileLink}"`);

        // No metadata for direct uploads — ask the user to categorize
        const keyboard = buildCategoryKeyboard('generic', filename);
        bot.sendMessage(msg.chat.id,
          `✅ Video saved! No TikTok metadata available for this one.\n\nWhat type of trip is this?`,
          { reply_markup: keyboard }
        );
      } catch (error) {
        bot.sendMessage(msg.chat.id, `❌ Failed to save video: ${error.message}`);
      }
      return;
    }

    if (text.trim()) {
      bot.sendMessage(msg.chat.id,
        `🤔 I don't see a TikTok link there.\n\nShare a TikTok video link or forward a video directly.`
      );
    }
    return;
  }

  // Found a TikTok URL — download it with metadata
  const statusMsg = await bot.sendMessage(msg.chat.id, '⏳ Downloading video...');

  const filename = generateFilename();
  const outputPath = path.join(INPUT_DIR, filename);

  const success = await downloadTikTok(url, outputPath);

  if (success && fs.existsSync(outputPath)) {
    // Read metadata and auto-detect category
    const metadata = readMetadata(outputPath);
    const suggestedCategory = detectCategoryFromMetadata(metadata);

    // Build a summary of what we found
    let metaInfo = '';
    if (metadata) {
      const desc = metadata.description.slice(0, 120);
      const tags = metadata.hashtags.slice(0, 5).join(' ');
      if (desc) metaInfo += `\n📝 "${desc}"`;
      if (tags) metaInfo += `\n🏷️ ${tags}`;
    }

    const emoji = TRIP_TEMPLATES[suggestedCategory]?.emoji || '';
    const keyboard = buildCategoryKeyboard(suggestedCategory, filename);

    await bot.editMessageText(
      `✅ Video downloaded!${metaInfo}\n\n🤖 Suggested: ${emoji} ${suggestedCategory}\n\nConfirm or pick a different category:`,
      {
        chat_id: msg.chat.id,
        message_id: statusMsg.message_id,
        reply_markup: keyboard,
      }
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
