# Video Generator — Claude Code Instructions

## What Is This?

Automated TikTok marketing video pipeline for PartyTab. Takes raw TikTok clips, categorizes them by trip type, generates themed PartyTab demo recordings with AI voiceover, and stitches them into ready-to-post videos.

## Daily Workflow

1. **Send TikToks** to @PartyTab_TokBot on Telegram (share link or forward video)
2. **Pick a category** from the inline keyboard (ski, beach, camping, etc.)
3. **Videos auto-generate** at 6 AM daily via launchd
4. **Review & upload** from `output/week-XX-xxx-XX/` to TikTok

## Architecture

```
TikTok link → Telegram Bot → yt-dlp download → input/
                                                  ↓
                                    Daily pipeline (6 AM)
                                                  ↓
    categorize-video.js  →  Detect trip type (metadata → filename → visual)
    tiktok-tts.js        →  Generate voiceover (ElevenLabs → Edge-TTS → macOS → silence)
    record-demo.js       →  Puppeteer renders themed PartyTab UI, captures frames → FFmpeg
    generate-videos.js   →  Stitch: hook clip + crossfade + demo + voiceover mix
                                                  ↓
                                output/week-XX/ + input/processed/
```

## Commands

```bash
# Manual pipeline run (processes all videos in input/)
node src/generate-videos.js

# Record a single demo
node src/record-demo.js [category] [output.mp4]

# Start Telegram bot manually
node src/telegram-bot.js

# Run daily script manually
./scripts/daily-generate.sh
```

## Key Files

| File | Purpose |
|------|---------|
| `src/generate-videos.js` | Master pipeline — orchestrates all steps, contains voiceover scripts |
| `src/record-demo.js` | Puppeteer-based demo recorder, captures frames → FFmpeg video |
| `src/tiktok-tts.js` | TTS with fallback chain: TikTok → ElevenLabs → Edge-TTS → macOS → silence |
| `src/categorize-video.js` | Trip type detection from metadata, filename, or visual content |
| `src/trip-templates.js` | Themed expense data per category (names, amounts, participants) |
| `src/telegram-bot.js` | Telegram bot for collecting TikTok clips + category selection |
| `assets/demo-template.html` | Local HTML clone of PartyTab UI used by Puppeteer |
| `scripts/daily-generate.sh` | Daily runner — processes new videos, archives to input/processed/ |

## Directories

| Directory | Contents |
|-----------|----------|
| `input/` | Unprocessed TikTok clips (.mp4) + metadata (.info.json, .category.json) |
| `input/processed/` | Already-processed clips (moved here after pipeline run) |
| `output/week-XX-xxx-XX/` | Generated videos organized by week, named by date |
| `assets/` | Demo template HTML, fonts, static assets |
| `temp/` | Transient frames/audio during generation (auto-cleaned) |
| `logs/` | Bot and pipeline logs |

## Background Services (launchd)

Both services survive reboots and run as your user account.

| Service | Plist | Behavior |
|---------|-------|----------|
| Telegram Bot | `~/Library/LaunchAgents/com.partytab.telegram-bot.plist` | Always on, auto-restarts |
| Daily Pipeline | `~/Library/LaunchAgents/com.partytab.daily-generate.plist` | Runs at 6:00 AM daily |

```bash
# Stop services
launchctl unload ~/Library/LaunchAgents/com.partytab.telegram-bot.plist
launchctl unload ~/Library/LaunchAgents/com.partytab.daily-generate.plist

# Start services
launchctl load ~/Library/LaunchAgents/com.partytab.telegram-bot.plist
launchctl load ~/Library/LaunchAgents/com.partytab.daily-generate.plist

# Check status
launchctl list | grep partytab
```

## Environment Variables (.env)

| Variable | Required | Purpose |
|----------|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot API token |
| `TELEGRAM_USER_ID` | Yes | Your Telegram user ID (security: only accepts your messages) |
| `ELEVENLABS_API_KEY` | No | ElevenLabs TTS (10k chars/month free). Falls back to Edge-TTS without it. |
| `ELEVENLABS_VOICE_ID` | No | Default: Sarah (EXAVITQu4vr4xnSDxMaL) |
| `TIKTOK_SESSION_ID` | No | TikTok TTS API session (currently down; lasts ~2 months when working) |
| `POSTS_PER_WEEK` | No | Videos per week folder (default: 7) |
| `START_DATE` | No | First post date (daily script auto-advances this) |

## Video Pipeline Details

### Final Video Structure
1. **Hook** (3s) — First 3 seconds of the original TikTok clip
2. **Crossfade** (0.5s) — Fade transition into demo
3. **Demo** (~11-12s) — PartyTab UI walkthrough with 5 scenes
4. **Voiceover** — Starts at 2.5s (after hook), mixed at 100% over 30% original audio

### Demo Scenes (voice-synced)
- **Scene 1**: Dashboard with expenses appearing one by one (voice lines 0+1)
- **Scene 2**: Settlement view with transfer amounts (voice line 2)
- **Scene 3**: Transfers completing with green animation (voice line 3)
- **Scene 4**: "All settled!" banner (continuation of line 3)
- **Scene 5**: PartyTab.app CTA end screen (voice line 4)

### TTS Fallback Chain
1. TikTok API (classic voice — currently down)
2. ElevenLabs (Sarah voice, highest quality, 10k chars/month free)
3. Microsoft Edge Neural TTS (JennyNeural, free, needs `edge-tts` Python package)
4. macOS `say` command (built-in)
5. Silent audio (pipeline never breaks)

### Scene Padding Caps
Demo timing is voice-driven — line durations determine how long each scene holds. Safety caps prevent any scene from stretching too long if a TTS engine generates unusually slow audio:
- `fullListHold`: max 55 frames (1.83s)
- `afterTransfersHold`: max 30 frames (1.0s)
- `allSettledHold`: max 60 frames (2.0s)
- `ctaHold`: max 75 frames (2.5s)

## Trip Categories

ski, beach, bachelor, bachelorette, roadtrip, camping, lake, city, vegas, hiking, generic

Each category has themed expenses in `trip-templates.js` and a voiceover script in `generate-videos.js`.

## Dependencies

- **Node.js** — runtime
- **FFmpeg** — video encoding, audio processing, silence trimming
- **yt-dlp** — TikTok video downloading
- **Puppeteer** — headless Chrome for demo recording
- **edge-tts** (optional) — Python package for Microsoft Neural TTS (`pip install edge-tts`)

## Gotchas

- ElevenLabs free tier is 10k chars/month — roughly 50-60 videos. After that, falls back to Edge-TTS.
- Hiking L0 ("Hiking trip with the group") generates 4s+ audio on ElevenLabs for unknown reasons. The safety caps handle this.
- `yt-dlp --no-watermark` is not a valid flag anymore — the bot retries without it automatically.
- The Telegram bot can only have one instance running. If you get 409 Conflict errors, kill all instances: `pkill -f telegram-bot`
- The daily script uses `date -j` (BSD/macOS). Won't work on Linux without modification.
