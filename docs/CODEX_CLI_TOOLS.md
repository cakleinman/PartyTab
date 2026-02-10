# CLI Tools Configuration for Codex

This machine has authenticated CLI tools for GitHub, Vercel, and Supabase. Use these directly for platform operations instead of asking the user to perform manual steps.

---

## Authenticated CLIs

| Platform | Command | Auth Status | Account |
|----------|---------|-------------|---------|
| **GitHub** | `gh` | ✓ Authenticated | cakleinman |
| **Vercel** | `npx vercel` | ✓ Authenticated | cakleinman |
| **Supabase** | `supabase` | ✓ Authenticated | Linked |

---

## GitHub CLI (`gh`)

### Check Authentication
```bash
gh auth status
```

### Repository Operations
```bash
# Clone a repository
gh repo clone owner/repo

# Create a new repository
gh repo create repo-name --public
gh repo create repo-name --private

# View repository info
gh repo view

# List repositories
gh repo list
```

### Pull Requests
```bash
# Create a PR
gh pr create --title "Title" --body "Description"

# Create PR with auto-fill from commits
gh pr create --fill

# List PRs
gh pr list

# View PR status
gh pr status

# Checkout a PR locally
gh pr checkout 123

# Merge a PR
gh pr merge 123 --merge
gh pr merge 123 --squash
gh pr merge 123 --rebase
```

### Issues
```bash
# Create an issue
gh issue create --title "Title" --body "Description"

# List issues
gh issue list

# View an issue
gh issue view 123

# Close an issue
gh issue close 123
```

### GitHub Actions
```bash
# List workflow runs
gh run list

# View a specific run
gh run view 123

# Watch a run in progress
gh run watch 123

# Trigger a workflow
gh workflow run workflow-name.yml
```

### Gists
```bash
# Create a gist
gh gist create file.txt

# List gists
gh gist list
```

---

## Vercel CLI (`npx vercel`)

**IMPORTANT**: Always use `--yes` flag for non-interactive mode.

### Check Authentication
```bash
npx vercel whoami
```

### Project Linking
```bash
# Link current directory to a Vercel project
npx vercel link --yes

# Link to specific project
npx vercel link --project project-name --yes
```

### Deployments
```bash
# Deploy preview (default)
npx vercel --yes

# Deploy to production
npx vercel --prod --yes

# Deploy with specific settings
npx vercel --yes --build-env NODE_ENV=production

# List deployments
npx vercel ls

# Inspect a deployment
npx vercel inspect deployment-url
```

### Environment Variables
```bash
# Pull environment variables to .env.local
npx vercel env pull

# Pull to specific file
npx vercel env pull .env.local

# Add an environment variable
npx vercel env add VARIABLE_NAME

# List environment variables
npx vercel env ls

# Remove an environment variable
npx vercel env rm VARIABLE_NAME
```

### Domains
```bash
# List domains
npx vercel domains ls

# Add a domain
npx vercel domains add domain.com

# Verify domain
npx vercel domains verify domain.com
```

### Logs
```bash
# View deployment logs
npx vercel logs deployment-url

# Follow logs in real-time
npx vercel logs deployment-url --follow
```

### Project Management
```bash
# List projects
npx vercel project ls

# Remove a project
npx vercel project rm project-name
```

---

## Supabase CLI (`supabase`)

### Check Authentication
```bash
supabase projects list
```

### Project Linking
```bash
# Link to a Supabase project (required before most commands)
supabase link --project-ref your-project-ref

# You'll be prompted for database password
# Or use: supabase link --project-ref ref --password your-password
```

### Database Operations
```bash
# Push local migrations to remote database
supabase db push

# Pull remote schema to local
supabase db pull

# Create a new migration
supabase migration new migration_name

# List migrations
supabase migration list

# Reset local database
supabase db reset

# Diff local vs remote
supabase db diff
```

### TypeScript Types Generation
```bash
# Generate types from linked project
supabase gen types typescript --linked > src/types/supabase.ts

# Generate types from local database
supabase gen types typescript --local > src/types/supabase.ts
```

### Edge Functions
```bash
# Create a new function
supabase functions new function-name

# Deploy a function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy

# Serve functions locally
supabase functions serve

# List functions
supabase functions list
```

### Local Development
```bash
# Start local Supabase stack
supabase start

# Stop local stack
supabase stop

# View local status
supabase status

# View local credentials (API URL, keys, etc.)
supabase status
```

### Authentication
```bash
# Login to Supabase
supabase login

# Check login status
supabase projects list
```

### Secrets Management
```bash
# Set a secret for edge functions
supabase secrets set SECRET_NAME=secret_value

# List secrets
supabase secrets list

# Unset a secret
supabase secrets unset SECRET_NAME
```

---

## Common Workflows

### Deploy Full Stack App

```bash
# 1. Push database changes
supabase db push

# 2. Generate fresh TypeScript types
supabase gen types typescript --linked > src/types/supabase.ts

# 3. Deploy edge functions
supabase functions deploy

# 4. Deploy frontend to Vercel
npx vercel --prod --yes
```

### Create Feature Branch PR

```bash
# 1. Create and push branch
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature

# 2. Create PR
gh pr create --title "Add new feature" --body "Description of changes"
```

### Set Up New Project

```bash
# 1. Create GitHub repo
gh repo create project-name --public

# 2. Link Supabase project
supabase link --project-ref your-ref

# 3. Link Vercel project
npx vercel link --yes

# 4. Pull environment variables
npx vercel env pull
```

---

## Error Handling

### If a CLI command fails with auth error:
1. Check status: `gh auth status`, `npx vercel whoami`, `supabase projects list`
2. These should all work - if not, notify the user that re-authentication is needed

### If Vercel deploy fails:
1. Check build logs: `npx vercel logs <deployment-url>`
2. Verify environment variables: `npx vercel env ls`

### If Supabase push fails:
1. Check migration status: `supabase migration list`
2. Pull current state: `supabase db pull`
3. Review diff: `supabase db diff`

---

## Best Practices

1. **Always use `--yes` with Vercel** - Prevents interactive prompts
2. **Link projects first** - Run `supabase link` and `npx vercel link` before other commands
3. **Generate types after schema changes** - Keep TypeScript types in sync with database
4. **Use GitHub CLI for all Git operations** - It's authenticated and ready
5. **Check status before operations** - Verify auth is working before multi-step workflows

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy to Vercel (preview) | `npx vercel --yes` |
| Deploy to Vercel (prod) | `npx vercel --prod --yes` |
| Push DB migrations | `supabase db push` |
| Generate TS types | `supabase gen types typescript --linked` |
| Create PR | `gh pr create --fill` |
| Deploy edge function | `supabase functions deploy function-name` |
| Pull env vars | `npx vercel env pull` |
| Check all auth | `gh auth status && npx vercel whoami && supabase projects list` |
