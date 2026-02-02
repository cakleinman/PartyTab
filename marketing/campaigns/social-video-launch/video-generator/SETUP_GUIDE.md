# TikTok Video Generator - Setup Guide

A complete guide to setting up your own automated TikTok content pipeline. This system lets you:

1. Share TikTok videos to a Telegram bot from your phone
2. AI automatically categorizes the content
3. Generates a demo video of your app with matching theme
4. Adds a TikTok-style voiceover
5. Outputs ready-to-post videos

**Total cost: $0** — Everything runs locally using free tools.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install Core Tools](#2-install-core-tools)
3. [Create Your Telegram Bot](#3-create-your-telegram-bot)
4. [Configure the Project](#4-configure-the-project)
5. [Customize for Your Product](#5-customize-for-your-product)
6. [Daily Workflow](#6-daily-workflow)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

You need a Mac with these installed:

### Homebrew (macOS package manager)

Open Terminal and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. After installation, run the commands it tells you to add Homebrew to your PATH.

### Node.js

```bash
brew install node
```

Verify installation:

```bash
node --version   # Should show v18+ or higher
npm --version    # Should show 9+ or higher
```

### Python 3

macOS usually has Python 3 pre-installed. Check with:

```bash
python3 --version
```

If not installed:

```bash
brew install python
```

---

## 2. Install Core Tools

Run these commands in Terminal:

### FFmpeg (video processing)

```bash
brew install ffmpeg
```

### yt-dlp (TikTok video downloader)

```bash
pip3 install yt-dlp
```

If `yt-dlp` command isn't found after installation, add Python packages to your PATH:

```bash
echo 'export PATH="$PATH:$HOME/Library/Python/3.9/bin"' >> ~/.zshrc
source ~/.zshrc
```

(Replace `3.9` with your Python version if different)

### Ollama + LLaVA (local AI for video categorization)

```bash
# Install Ollama
brew install ollama

# Pull the vision model (this downloads ~4GB)
ollama pull llava
```

**Test it works:**

```bash
ollama serve
```

Leave this running in the background (or open a new Terminal tab for other commands).

---

## 3. Create Your Telegram Bot

You need two things: a **bot token** and your **user ID**.

### Step 1: Create the Bot

1. Open Telegram on your phone or desktop
2. Search for **@BotFather** (the official Telegram bot for creating bots)
3. Send `/newbot`
4. Follow the prompts:
   - Choose a name (e.g., "My TikTok Collector")
   - Choose a username ending in `bot` (e.g., `MyTikTokCollectorBot`)
5. BotFather will give you a **token** that looks like:
   ```
   8527049971:AAF6DjLcf1rvlzFzxstRCmdeCmSk_voCVj8
   ```
6. **Save this token** — you'll need it shortly

### Step 2: Get Your User ID

1. Search for **@userinfobot** in Telegram
2. Start a chat and send any message
3. It will reply with your user ID (a number like `8561700571`)
4. **Save this ID** — it ensures only YOU can use your bot

### Step 3: Start a Chat with Your Bot

1. Search for your bot by its username (e.g., `@MyTikTokCollectorBot`)
2. Tap **Start**
3. Send `/start` to initialize it

---

## 4. Configure the Project

### Step 1: Get the Project Files

Copy the `video-generator` folder to your computer. The structure should look like:

```
video-generator/
├── src/
│   ├── telegram-bot.js
│   ├── generate-videos.js
│   ├── categorize-video.js
│   ├── trip-templates.js
│   ├── tiktok-tts.js
│   └── record-demo.js
├── input/
├── output/
├── assets/
├── temp/
├── package.json
└── .env
```

### Step 2: Create Your `.env` File

In the `video-generator` folder, create a file named `.env` with:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_USER_ID=your_user_id_here
POSTS_PER_WEEK=7
START_DATE=2025-01-20
```

Replace:
- `your_bot_token_here` with the token from BotFather
- `your_user_id_here` with your numeric user ID
- `START_DATE` with today's date (YYYY-MM-DD format)

### Step 3: Install Node Dependencies

```bash
cd video-generator
npm install
```

---

## 5. Customize for Your Product

The default setup is configured for a specific app. Here's how to adapt it for YOUR product:

### A. Update Demo Recording (`src/record-demo.js`)

This file controls what gets recorded as your "product demo". You'll need to:

1. **Change the URL** to your app/website:
   ```javascript
   // Find this line and change the URL:
   await page.goto('[YOUR_APP_URL]');
   ```

2. **Update the Puppeteer selectors** to match your app's UI elements:
   ```javascript
   // These CSS selectors need to match YOUR app's HTML:
   await page.click('[data-testid="add-expense-button"]');
   await page.type('[data-testid="expense-input"]', 'Your expense');
   ```

3. **Adjust the recording flow** to showcase your product's features

### B. Update Categories (`src/trip-templates.js`)

This file defines:
- What categories the AI can detect
- What demo content to show for each category

Example structure:
```javascript
export const templates = {
  // Category name (AI will detect these from videos)
  ski: {
    expenses: ['Cabin rental', 'Lift tickets', 'Ski rentals'],
    script: 'POV: You just got back from an epic ski trip...'
  },
  // Add your own categories:
  [YOUR_CATEGORY]: {
    expenses: ['Item 1', 'Item 2', 'Item 3'],
    script: 'Your voiceover script here...'
  }
};
```

### C. Update Voiceover Scripts (`src/tiktok-tts.js`)

The TTS uses TikTok's voice API. You can change:
- The voice (Jessie, Joey, UK accents, etc.)
- The script content

Available voices:
- `en_us_001` - Female (default)
- `en_us_006` - Male
- `en_uk_001` - UK Female
- `en_uk_003` - UK Male
- `en_us_ghostface` - Ghostface (fun)
- `en_us_chewbacca` - Chewbacca (very fun)

### D. Update Video Categories (`src/categorize-video.js`)

This uses AI to analyze TikTok videos and categorize them. The prompt tells the AI what categories to look for. Update it to match your product's use cases.

---

## 6. Daily Workflow

### Morning Routine

**Terminal Tab 1 — Start Ollama (AI):**
```bash
ollama serve
```
Leave this running.

**Terminal Tab 2 — Start Telegram Bot:**
```bash
cd video-generator
npm run bot
```
Leave this running. You'll see: `Bot is ready!`

### Throughout the Day

1. **Browse TikTok** on your phone
2. When you find a relevant video, tap **Share → Telegram → [Your Bot]**
3. The bot will download it and confirm: `Video saved! Total queued: X`

### Bot Commands

Send these to your bot in Telegram:
- `/status` — See how many videos are queued
- `/list` — List all queued videos
- `/clear` — Delete all queued videos

### Generate Videos

When you have enough clips (5-10 recommended):

```bash
npm run generate
```

This will:
1. Analyze each video with AI
2. Record matching product demos
3. Generate voiceovers
4. Stitch everything together
5. Output to `output/week-XX-mon-DD/` folders

### Upload to TikTok

1. Go to [TikTok.com](https://tiktok.com) on desktop
2. Click **Upload**
3. Select videos from `output/` folder
4. Schedule each video for its filename date (e.g., `2025-01-20-mon.mp4` → schedule for Jan 20)

---

## 7. Troubleshooting

### "Ollama not running"

Start Ollama in a separate terminal:
```bash
ollama serve
```

### "LLaVA model not found"

Download the model:
```bash
ollama pull llava
```

### "yt-dlp command not found"

Add Python packages to your PATH:
```bash
echo 'export PATH="$PATH:$HOME/Library/Python/3.9/bin"' >> ~/.zshrc
source ~/.zshrc
```

### "TTS not working / rate limited"

TikTok's API can rate-limit you. The code has a 200ms delay built in, but if you hit limits:
- Wait a few minutes
- Reduce batch size

### "Bot not receiving messages"

1. Check your `.env` file has the correct token
2. Make sure you sent `/start` to the bot
3. Verify the bot is running (`npm run bot`)

### "Videos not downloading"

Update yt-dlp to the latest version:
```bash
pip3 install --upgrade yt-dlp
```

If links still fail, try **sharing the video directly** (as a video file) instead of sharing the link.

### "Demo recording shows wrong content"

The Puppeteer selectors in `record-demo.js` need to match your app's actual HTML. Use your browser's DevTools to find the correct selectors.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start AI | `ollama serve` |
| Start bot | `npm run bot` |
| Generate videos | `npm run generate` |
| Check bot status | Send `/status` to bot |
| Clear queue | Send `/clear` to bot |
| Update yt-dlp | `pip3 install --upgrade yt-dlp` |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  YOU: Find TikTok → Share to Telegram bot                        │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  TELEGRAM BOT: Downloads video via yt-dlp → saves to input/      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  OLLAMA + LLAVA: Analyzes video → "ski trip", "beach", etc.      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  PUPPETEER: Records your app demo matching the category          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  TIKTOK TTS: Generates voiceover from category script            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  FFMPEG: Stitches source clip + demo + voiceover → final video   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  OUTPUT: Ready-to-post video in output/week-XX/ folder           │
└──────────────────────────────────────────────────────────────────┘
```

---

**Questions?** Check the main README.md or reach out for help.
