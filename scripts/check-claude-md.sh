#!/usr/bin/env bash
# Checks CLAUDE.md for stale counts and missing entries.
# Run after major changes: bash scripts/check-claude-md.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_MD="$ROOT/CLAUDE.md"
RULES_DIR="$ROOT/.claude/rules"
ISSUES=()

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Checking CLAUDE.md for staleness..."
echo ""

# 1. Test case count (matches "~91 cases")
ACTUAL_TESTS=$(grep -r "it(" "$ROOT/tests/" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
CLAIMED_TESTS=$(sed -n 's/.*~\([0-9]*\) cases.*/\1/p' "$CLAUDE_MD" | head -1)
CLAIMED_TESTS=${CLAIMED_TESTS:-0}
if [ "$ACTUAL_TESTS" != "$CLAIMED_TESTS" ]; then
  ISSUES+=("Test count: CLAUDE.md says ~${CLAIMED_TESTS}, actual is ${ACTUAL_TESTS}")
fi

# 2. Test file count (matches "across 5 files" on same line as test count)
ACTUAL_TEST_FILES=$(find "$ROOT/tests" -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l | tr -d ' ')
CLAIMED_TEST_FILES=$(sed -n 's/.*across \([0-9]*\) files.*/\1/p' "$CLAUDE_MD" | head -1)
CLAIMED_TEST_FILES=${CLAIMED_TEST_FILES:-0}
if [ "$ACTUAL_TEST_FILES" != "$CLAIMED_TEST_FILES" ]; then
  ISSUES+=("Test file count: CLAUDE.md says ${CLAIMED_TEST_FILES} files, actual is ${ACTUAL_TEST_FILES}")
fi

# 3. API route count (matches "~44 route")
ACTUAL_ROUTES=$(find "$ROOT/app/api" -name "route.ts" 2>/dev/null | wc -l | tr -d ' ')
CLAIMED_ROUTES=$(sed -n 's/.*~\([0-9]*\) route.*/\1/p' "$CLAUDE_MD" | head -1)
CLAIMED_ROUTES=${CLAIMED_ROUTES:-0}
if [ "$ACTUAL_ROUTES" != "$CLAIMED_ROUTES" ]; then
  ISSUES+=("API route count: CLAUDE.md says ~${CLAIMED_ROUTES}, actual is ${ACTUAL_ROUTES}")
fi

# 4. Migration count (matches "3 migration files")
ACTUAL_MIGRATIONS=$(find "$ROOT/prisma/migrations" -maxdepth 1 -type d ! -name "migrations" 2>/dev/null | wc -l | tr -d ' ')
CLAIMED_MIGRATIONS=$(sed -n 's/.*(\([0-9]*\) migration files).*/\1/p' "$CLAUDE_MD" | head -1)
CLAIMED_MIGRATIONS=${CLAIMED_MIGRATIONS:-0}
if [ "$ACTUAL_MIGRATIONS" != "$CLAIMED_MIGRATIONS" ]; then
  ISSUES+=("Migration count: CLAUDE.md says ${CLAIMED_MIGRATIONS}, actual is ${ACTUAL_MIGRATIONS}")
fi

# 5. Check lib/ subdirectories are listed
for dir in "$ROOT"/lib/*/; do
  dirname=$(basename "$dir")
  if ! grep -q "$dirname" "$CLAUDE_MD" 2>/dev/null; then
    ISSUES+=("Missing lib/ directory in CLAUDE.md: lib/${dirname}/")
  fi
done

# 6. Check .claude/rules files exist and are referenced
if [ -d "$RULES_DIR" ]; then
  for rule in "$RULES_DIR"/*.md; do
    rulename=$(basename "$rule")
    if [ "$rulename" != "maintenance.md" ] && ! grep -q "$rulename" "$CLAUDE_MD" 2>/dev/null; then
      ISSUES+=("Rules file not referenced in CLAUDE.md: .claude/rules/${rulename}")
    fi
  done
fi

# Report
echo ""
if [ ${#ISSUES[@]} -eq 0 ]; then
  echo -e "${GREEN}All checks passed. CLAUDE.md is up to date.${NC}"
  exit 0
else
  echo -e "${YELLOW}Found ${#ISSUES[@]} issue(s):${NC}"
  echo ""
  for issue in "${ISSUES[@]}"; do
    echo -e "  ${RED}*${NC} $issue"
  done
  echo ""
  echo "Run this after fixing: bash scripts/check-claude-md.sh"
  exit 1
fi
