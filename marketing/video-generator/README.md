# PartyTab TikTok Video Generator

Fully automated video generation system for PartyTab TikTok content.

## How It Works

```
You scroll TikTok, share travel videos to @PartyTab_TokBot
                    ↓
Bot downloads the videos to input/ folder
                    ↓
Run: npm run generate
                    ↓
AI analyzes each video → "ski trip", "beach", "bachelor party", etc.
                    ↓
Records themed PartyTab demo (matching expenses)
                    ↓
Generates TikTok voice narration
                    ↓
Stitches: source clip + demo + voiceover
                    ↓
Outputs to weekly folders (week-01-jan-20/, week-02-jan-27/, etc.)
                    ↓
You upload to TikTok and schedule
```

## Setup

### 1. Install Prerequisites

```bash
# FFmpeg (video processing)
brew install ffmpeg

# yt-dlp (TikTok downloads)
pip3 install yt-dlp

# Add to PATH (if needed)
echo 'export PATH="$PATH:/Users/$(whoami)/Library/Python/3.9/bin"' >> ~/.zshrc
source ~/.zshrc
```

### 2. Install Ollama (for AI categorization)

```bash
# Download from https://ollama.ai or:
brew install ollama

# Pull the vision model
ollama pull llava

# Start Ollama (keep running in background)
ollama serve
```

### 3. Install Node Dependencies

```bash
cd marketing/video-generator
npm install
```

## Usage

### Step 1: Collect TikTok Clips

Start the Telegram bot:
```bash
npm run bot
```

On your Android phone:
1. Open TikTok
2. Find travel/group trip videos
3. Tap Share → Telegram → PartyTab_TokBot

Bot commands:
- `/status` — See how many clips are queued
- `/list` — List all clips
- `/clear` — Delete all clips

### Step 2: Generate Videos

Once you have clips collected:
```bash
npm run generate
```

This will:
1. Analyze each clip with AI to detect trip type
2. Record themed PartyTab demos
3. Generate TikTok voiceovers
4. Create final stitched videos
5. Output to weekly folders

### Step 3: Upload to TikTok

Output structure:
```
output/
├── week-01-jan-20/
│   ├── 2025-01-20-mon.mp4
│   ├── 2025-01-21-tue.mp4
│   ├── 2025-01-22-wed.mp4
│   └── ...
├── week-02-jan-27/
│   └── ...
```

1. Go to TikTok.com on desktop
2. Upload videos from current week
3. Schedule each for its filename date
4. Repeat every 10 days

## Configuration

Edit `.env`:

```env
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_USER_ID=your_id
POSTS_PER_WEEK=7
START_DATE=2025-01-20
```

## Trip Categories

The AI auto-detects these trip types and creates matching demos:

| Category | Example Expenses |
|----------|-----------------|
| ski | Cabin, lift tickets, ski rentals, groceries |
| beach | Beach house, jet skis, seafood dinner |
| bachelor | Airbnb, bottle service, steakhouse, golf |
| bachelorette | Airbnb, spa day, brunch, wine tour |
| roadtrip | Gas, motel, food stops, park passes |
| camping | Campsite, firewood, food, gear rental |
| lake | Lake house, boat rental, fishing gear |
| city | Hotel, concerts, dinners, Ubers |
| vegas | Hotel suite, club table, shows |
| hiking | Cabin, gear, permits, snacks |
| generic | Accommodation, activities, food, transport |

## Folder Structure

```
video-generator/
├── input/           # TikTok clips (auto-filled by bot)
├── output/          # Generated videos (by week)
├── assets/          # Sound effects, etc.
├── temp/            # Processing (auto-cleaned)
├── src/
│   ├── telegram-bot.js     # Clip collection bot
│   ├── categorize-video.js # AI vision analysis
│   ├── trip-templates.js   # Expense templates
│   ├── record-demo.js      # PartyTab screen recorder
│   ├── tiktok-tts.js       # TikTok voice generator
│   └── generate-videos.js  # Main pipeline
├── .env
└── package.json
```

## Troubleshooting

**"Ollama not running"**
- Start Ollama: `ollama serve`
- Or install from https://ollama.ai

**"LLaVA model not found"**
- Run: `ollama pull llava`

**TTS not working**
- TikTok's API can rate-limit
- Wait a few minutes and try again

**Bot not receiving messages**
- Check bot token in `.env`
- Make sure bot is running (`npm run bot`)

**Videos not downloading**
- Update yt-dlp: `pip3 install --upgrade yt-dlp`
- Try sharing video directly instead of link

## Cost

**$0** — Everything runs locally using free tools:
- Ollama + LLaVA (free, local AI)
- TikTok TTS API (free, unofficial)
- FFmpeg (free, open source)
- Puppeteer (free, open source)
