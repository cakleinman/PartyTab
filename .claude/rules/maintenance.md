# CLAUDE.md Maintenance Rules

## When to Update

Update CLAUDE.md (or the relevant rules file) after any of these changes:

- **New API route** — update route count in CLAUDE.md
- **New test file or significant test additions** — update test count
- **New lib/ module** — add to project structure
- **New app/ page or directory** — add to project structure
- **New shared utility** — add to "Shared utilities" list in Code Style
- **New guard, validator, or response helper** — update api-patterns.md
- **New database model or enum** — update database-and-money.md
- **New environment variable** — add to Environment Variables section
- **Dependency version bump (major)** — update Tech Stack table
- **New gotcha discovered** — add to Gotchas section

## How to Update

1. Make the code change first
2. Update the relevant file (CLAUDE.md or `.claude/rules/*.md`)
3. Run `scripts/check-claude-md.sh` to verify accuracy
4. Include the CLAUDE.md update in the same commit as the code change

## Staleness Check

Run `scripts/check-claude-md.sh` periodically. It checks:
- Test case count matches CLAUDE.md
- API route count matches CLAUDE.md
- Test file count is current
- Migration file count is current
- All lib/ subdirectories are listed

## What Belongs Where

| Content | Location |
|---------|----------|
| Project orientation, tech stack, commands | `CLAUDE.md` (root) |
| API patterns, guards, validators, response helpers | `.claude/rules/api-patterns.md` |
| Database schema, money handling, settlement | `.claude/rules/database-and-money.md` |
| These maintenance rules | `.claude/rules/maintenance.md` |
| Recent refactors, temporary gotchas, changelog | `MEMORY.md` (auto memory) |

## Principles

- **Prune aggressively** — if Claude handles something correctly without the instruction, remove it
- **Be specific** — "Use `EMAIL_REGEX.test()` for optional emails" beats "validate emails carefully"
- **No duplication** — each fact lives in exactly one place
- **Root file stays short** — detailed reference goes in `.claude/rules/`
