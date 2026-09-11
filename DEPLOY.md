# Deployment Guide — Kenya GovDash

Complete guide to deploy Kenya GovDash to Vercel (recommended), with Turso (SQLite) or Supabase (PostgreSQL).

---

## 🚀 Option A: Vercel + Turso (Recommended — Simplest)

Turso is SQLite-compatible at the edge. No Prisma schema changes needed.

### Step 1: Create Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create kenya-govdash

# Get connection string + auth token
turso db show kenya-govdash --url
# → libsql://kenya-govdash-<your-username>.turso.io

turso db tokens create kenya-govdash
# → eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# Combined connection string for Prisma:
# libsql://kenya-govdash-xxx.turso.io?authToken=eyJhbGci...
```

### Step 2: Push Schema to Turso

```bash
# Set DATABASE_URL to Turso
export DATABASE_URL="libsql://kenya-govdash-xxx.turso.io?authToken=eyJhbGci..."

# Generate Prisma client
bunx prisma generate

# Push schema
bunx prisma db push
```

### Step 3: Deploy to Vercel

```bash
# Option 1: Via Vercel CLI
npm i -g vercel
vercel

# Follow prompts:
# ? Set up and deploy "~/Kenya-GovDash"? [Y/n] y
# ? Which scope do you want to deploy to? → your-account
# ? Link to existing project? [y/N] n
# ? What's your project's name? → kenya-govdash
# ? In which directory is your code located? → ./
# ? Want to modify these settings? → N

# Option 2: Via Vercel Dashboard
# 1. Go to vercel.com → New Project
# 2. Import from GitHub → select Devcode940/Kenya-GovDash
# 3. Framework Preset: Next.js (auto-detected)
# 4. Build Command: bun run build (auto-detected from vercel.json)
# 5. Install Command: bun install (auto-detected)
# 6. Click Deploy
```

### Step 4: Set Environment Variables in Vercel

Go to **Vercel Dashboard → your project → Settings → Environment Variables** and add:

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | `libsql://kenya-govdash-xxx.turso.io?authToken=eyJhbGci...` | ✅ Yes |
| `JWT_SECRET` | Generate with `openssl rand -hex 32` | ✅ Yes |
| `ADMIN_PASSWORD_HASH` | `$2b$10$zwCrCu9DgB4BvAaJUcPbPOkNnxa0HvNMBZfXH6XVqSYOl43PYkK2C` (default: kenya-oversight-2026) | ✅ Yes |
| `NEXT_PUBLIC_BASE_URL` | `https://kenya-govdash.vercel.app` (your Vercel URL) | ✅ Yes |
| `MISTRAL_API_KEY` | Your Mistral AI key from [console.mistral.ai](https://console.mistral.ai/) | Optional |
| `RESEND_API_KEY` | Your Resend key from [resend.com](https://resend.com/) | Optional |
| `MAIL_FROM` | `Kenya GovDash <noreply@yourdomain.com>` | Optional |
| `MAIL_REPLY_TO` | `support@yourdomain.com` | Optional |
| `CRON_SECRET` | Generate with `openssl rand -hex 32` | Optional (for Vercel Cron) |

### Step 5: Update NEXT_PUBLIC_BASE_URL

After your first deploy, Vercel assigns a URL (e.g., `kenya-govdash-abc123.vercel.app`).

1. Go to **Settings → Environment Variables**
2. Update `NEXT_PUBLIC_BASE_URL` to `https://kenya-govdash-abc123.vercel.app`
3. Also update the `build.env.NEXT_PUBLIC_BASE_URL` in `vercel.json` to match
4. Redeploy

### Step 6: Configure Vercel Cron (Optional)

The `vercel.json` already includes a cron job that runs `/api/finance-alerts/check` every 15 minutes.

To enable:
1. Set `CRON_SECRET` env var (generate with `openssl rand -hex 32`)
2. Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` to the cron endpoint
3. The endpoint validates this header + processes pending alerts

**Note:** Vercel Cron is available on **Pro plans** (free on Hobby for limited usage). On Hobby, you can use [cron-job.org](https://cron-job.org) instead:

```
URL: https://your-app.vercel.app/api/finance-alerts/check
Method: POST
Header: x-cron-secret: <your-CRON_SECRET-value>
Schedule: */15 * * * *
```

### Step 7: Ingest PDFs (Optional)

After deployment, you can ingest PDFs via the admin UI:

1. Go to `https://your-app.vercel.app/admin`
2. Login with password `kenya-oversight-2026`
3. Click "Ingested PDFs" tab → "Upload PDF"
4. Upload CoB/OAG PDF reports
5. Text is extracted automatically + indexed for search

Or via CLI:
```bash
# Set DATABASE_URL to production Turso
export DATABASE_URL="libsql://kenya-govdash-xxx.turso.io?authToken=..."

# Run ingestion script
bun scripts/ingest_pdfs.ts
```

---

## 🗄️ Option B: Vercel + Supabase (PostgreSQL)

Use this if you need PostgreSQL features (full-text search, JSON queries, etc.).

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Set name: `kenya-govdash`
3. Set database password (save it!)
4. Wait for project to provision (~2 min)
5. Go to **Settings → Database → Connection string**
6. Copy the **URI** format: `postgresql://postgres.<ref>:<password>@<host>:5432/postgres`

### Step 2: Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Push Schema

```bash
export DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.supabase.co:5432/postgres"

bunx prisma generate
bunx prisma db push
```

### Step 4: Deploy to Vercel

Same as Option A Step 3, but set `DATABASE_URL` to the Supabase connection string.

---

## 🐳 Option C: Self-Hosted (Docker)

### Dockerfile

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client + build
RUN bunx prisma generate
RUN bun run build

# Production image
FROM oven/bun:1-slim AS runner
WORKDIR /app

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./data/govdash.db
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
      - MISTRAL_API_KEY=${MISTRAL_API_KEY}
      - NEXT_PUBLIC_BASE_URL=http://localhost:3000
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### Build + Run

```bash
# Create .env with secrets
echo 'JWT_SECRET='$(openssl rand -hex 32) >> .env
echo 'ADMIN_PASSWORD_HASH=$2b$10$zwCrCu9DgB4BvAaJUcPbPOkNnxa0HvNMBZfXH6XVqSYOl43PYkK2C' >> .env

# Build + run
docker-compose up -d

# Push schema to the SQLite volume
docker-compose exec app bunx prisma db push
```

---

## 🔧 vercel.json Configuration Reference

The `vercel.json` file configures:

| Section | Purpose |
|---|---|
| `framework` | Auto-detected as `nextjs` |
| `buildCommand` | `bun run build` |
| `installCommand` | `bun install` |
| `regions` | `fra1` (Frankfurt — closest to Kenya) |
| `functions` | Per-route max duration (AI=60s, PDF extract=300s, parliament refresh=300s) |
| `headers` | Security headers (X-Frame-Options, noindex for /admin, cache-control for APIs) |
| `redirects` | Legacy URL redirects (/reps → /representatives, /dashboard → /) |
| `rewrites` | API alias (/api/open-data → /api/finance-audit) |
| `crons` | Scheduled job: finance alerts every 15 min |
| `github.silent` | Disable Vercel bot comments on PRs |

### Changing the Deployment Region

Edit `vercel.json` → `regions`:

```json
"regions": ["fra1"]  // Frankfurt (default — closest to Kenya)
// Alternatives:
// "regions": ["iad1"]  // Washington DC (US East)
// "regions": ["sfo1"]  // San Francisco (US West)
// "regions": ["sin1"]  // Singapore (Asia)
```

---

## 📋 Post-Deployment Checklist

- [ ] **Environment variables set** — all required vars in Vercel dashboard
- [ ] **Database pushed** — `bunx prisma db push` with production DATABASE_URL
- [ ] **Admin password changed** — generate new hash with `bunx bcryptjs hash "new-password" 10`
- [ ] **NEXT_PUBLIC_BASE_URL updated** — matches your Vercel domain
- [ ] **Vercel Cron working** — check Vercel dashboard → Cron Jobs tab
- [ ] **AI assistant working** — test at `/admin` → click AI button
- [ ] **PWA installable** — visit on mobile → install prompt appears
- [ ] **Custom domain** (optional) — Vercel → Settings → Domains → add your domain
- [ ] **Analytics** (optional) — enable Vercel Analytics in dashboard
- [ ] **PDFs ingested** — upload CoB/OAG PDFs via admin

---

## 🔍 Troubleshooting

### Build fails on Vercel

```bash
# Check if vercel.json is valid JSON
cat vercel.json | python3 -m json.tool

# Common issues:
# 1. Missing DATABASE_URL → set in Vercel env vars
# 2. Prisma client not generated → ensure buildCommand includes prisma generate
# 3. Bun version mismatch → add "engines": {"bun": ">=1.3.0"} to package.json
```

### Database connection errors

```bash
# Turso: verify connection
turso db shell kenya-govdash "SELECT 1;"

# Supabase: verify connection
psql "postgresql://..." -c "SELECT 1;"
```

### Cron not running

1. Vercel Hobby plan: cron jobs are limited. Use [cron-job.org](https://cron-job.org) instead
2. Verify `CRON_SECRET` is set in Vercel env vars
3. Check Vercel → Functions → Logs for errors

### AI assistant returns rule-based answers

- Mistral: ensure `MISTRAL_API_KEY` is set
- z-ai: should work automatically (bundled with platform)
- Check function logs for LLM errors

### PWA not installable

- Ensure `manifest.json` is accessible at `/manifest.json`
- Check `NEXT_PUBLIC_BASE_URL` matches your domain
- Service worker must be at `/sw.js`

---

## 📞 Support

- **GitHub Issues**: [github.com/Devcode940/Kenya-GovDash/issues](https://github.com/Devcode940/Kenya-GovDash/issues)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Turso Docs**: [docs.turso.tech](https://docs.turso.tech)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
