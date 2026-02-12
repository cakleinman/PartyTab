#!/bin/bash
#
# Daily video generator — run by launchd once per day
# Processes any new TikToks in input/ and moves them to input/processed/
#

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_DIR="$PROJECT_DIR/input"
OUTPUT_DIR="$PROJECT_DIR/output"
PROCESSED_DIR="$INPUT_DIR/processed"
LOG_FILE="$PROJECT_DIR/logs/daily-generate.log"

mkdir -p "$PROCESSED_DIR" "$PROJECT_DIR/logs"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Count unprocessed videos
VIDEO_COUNT=$(find "$INPUT_DIR" -maxdepth 1 -name '*.mp4' | wc -l | tr -d ' ')

if [ "$VIDEO_COUNT" -eq 0 ]; then
  log "No new videos to process. Exiting."
  exit 0
fi

log "Found $VIDEO_COUNT new video(s) to process."

# Find the next available date by looking at existing output files
# Output filenames look like: 2026-02-15-sun.mp4
LATEST_DATE=""
if [ -d "$OUTPUT_DIR" ]; then
  LATEST_DATE=$(find "$OUTPUT_DIR" -name '*.mp4' -exec basename {} \; 2>/dev/null \
    | grep -oE '^[0-9]{4}-[0-9]{2}-[0-9]{2}' \
    | sort -r \
    | head -1)
fi

if [ -n "$LATEST_DATE" ]; then
  # Advance one day from the latest existing output
  START_DATE=$(date -j -v+1d -f "%Y-%m-%d" "$LATEST_DATE" "+%Y-%m-%d")
  log "Continuing from $LATEST_DATE → starting at $START_DATE"
else
  START_DATE=$(date "+%Y-%m-%d")
  log "No existing output. Starting from today: $START_DATE"
fi

# Export START_DATE for the pipeline
export START_DATE

# Run the pipeline
log "Running video generator..."
cd "$PROJECT_DIR"
if node src/generate-videos.js >> "$LOG_FILE" 2>&1; then
  log "Pipeline completed successfully."

  # Move processed input videos to processed/
  for mp4 in "$INPUT_DIR"/*.mp4; do
    [ -f "$mp4" ] || continue
    BASENAME=$(basename "$mp4")
    mv "$mp4" "$PROCESSED_DIR/$BASENAME"
    # Also move associated metadata files
    for ext in info.json category.json; do
      METAFILE="${mp4%.mp4}.$ext"
      [ -f "$METAFILE" ] && mv "$METAFILE" "$PROCESSED_DIR/${BASENAME%.mp4}.$ext"
    done
    log "  Archived: $BASENAME"
  done

  log "All videos archived to input/processed/"
else
  log "Pipeline failed! Input videos left in place for retry."
  exit 1
fi
