# NextAuth v5 Beta Tracking

## Current Status

**Version:** `next-auth@5.0.0-beta.30`  
**Added:** February 2026  
**Status:** Monitoring for stable release

## Why Beta?

NextAuth v5 is required for Next.js 16+ App Router support. The beta has been stable in production but should be upgraded when v5.0.0 (stable) releases.

## Upgrade Checklist

When v5 stable releases:

1. [ ] Review changelog: https://github.com/nextauthjs/next-auth/releases
2. [ ] Update `package.json`: `npm install next-auth@latest`
3. [ ] Run full test suite: `npm run test && npm run test:e2e`
4. [ ] Test auth flows manually:
   - [ ] Google OAuth sign-in
   - [ ] Apple OAuth sign-in  
   - [ ] Email sign-in
   - [ ] Session persistence
5. [ ] Deploy to staging and verify
6. [ ] Deploy to production

## Monitoring

- GitHub releases: https://github.com/nextauthjs/next-auth/releases
- NextAuth Discord: https://discord.gg/nextauth
- Twitter: @nextaborauth

---

*Last reviewed: February 2, 2026*
