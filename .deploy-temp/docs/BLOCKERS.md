# Blockers

## npm install failed (no network)

- Command: `npm install`
- Error: `getaddrinfo ENOTFOUND registry.npmjs.org`
- What I tried: re-ran install with longer timeout
- Suggested fix: ensure network/DNS access to npm registry and rerun `npm install`

## Clean install cleanup failed

- Command: `rm -rf node_modules .next`
- Error: `Permission denied` for `node_modules/next`
- What I tried: reran command after approval
- Suggested fix: remove with elevated permissions or fix filesystem permissions

## Git commits blocked

- Command: `git add ...`
- Error: `Unable to create .git/index.lock: Operation not permitted`
- What I tried: staging files
- Suggested fix: ensure write permissions for `.git` directory or remove stale lock file if present
