# Kenya Government Accountability Dashboard (Kenya GovDash)

A citizen oversight platform for Kenya's 47 counties — tracking government finance, audit opinions, elected representatives, and civic engagement. Built with Next.js 16, React 19, Prisma, and Tailwind CSS.

> **Non-partisan · Factual · Source-cited · Data-gap transparent**
> Sourced from OAG (Office of the Auditor General), CoB (Controller of Budget), CoG (Council of Governors), KNBS, and Parliament of Kenya.

---

## 🇰🇪 Features

### Core Dashboard
- **47 counties** with governors, senators, women reps, MPs, CECMs (440 records)
- **Bilingual** — English + Kiswahili (i18n toggle)
- **Mobile-first** with bottom nav (Home / AI / Profile)
- **Dark/light mode** + PWA installable
- **Command palette** (Cmd/Ctrl+K)

### Finance & Audit Dashboard (`/finance-audit`)
- **National + county-level** finance data (3 fiscal years)
- **Time-series charts** — absorption trends across FY 2021/22 → 2023/24
- **Radar comparison** — 3 counties across 4 metrics
- **Linear regression forecast** — predicts next FY absorption
- **Audit opinion distribution** — Unmodified / Qualified / Adverse / Disclaimer
- **Top/bottom performers** — CoG compliance score rankings
- **Per-county drill-down** at `/finance-audit/county/[name]`
- **Finance alerts** — subscribe to threshold-based email notifications
- **Auto-extraction** — parse finance data from CoB/OAG PDFs

### Representatives Directory (`/representatives`)
- **All elected officials** — governors, senators, women reps, MPs, CECMs
- **Search + filter** by name, county, party, coalition
- **Individual profile pages** at `/representative/[id]` with:
  - Biography + contacts (email, phone, Twitter, website)
  - Accountability scorecard (7 metrics)
  - Audit opinion history
  - Budget performance (absorption rates)
  - County finance link

### Additional Pages
- **Site-wide search** (`/search`) — counties, reps, finance, feedback, reports
- **County comparison** (`/compare`) — 2-5 counties side-by-side with radar chart + CSV export
- **Platform stats** (`/stats`) — transparency dashboard with engagement metrics
- **Public feedback** — submit + browse citizen feedback with status timelines
- **Secure whistleblower portal** — end-to-end encrypted (AES-GCM 256-bit) submissions

### AI Assistant
- **Real LLM** powered by Mistral AI (or z-ai-web-dev-sdk fallback)
- Structured Kenya data as context (finance, governors, CECMs, audit opinions)
- Available via mobile bottom nav + API endpoint
- Rule-based fallback when no LLM is configured

### Admin Console (`/admin`)
- **Password:** `kenya-oversight-2026` (change via `ADMIN_PASSWORD_HASH` env var)
- **Sections:**
  - Oversight Resources (OAG / CoB / CoG / EACC / TI-Kenya / Other)
  - Finance & Audit snapshots (CRUD + CSV export)
  - CECM Name Verification (440 positions, progress tracking)
  - Auto-extract finance from PDFs (table parser + regex fallback)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** or **Bun 1.3+**
- **SQLite** (included — no external DB needed for dev)

### Install + Run

```bash
# Clone
git clone https://github.com/Devcode940/Kenya-GovDash.git
cd Kenya-GovDash

# Install dependencies
bun install
# or: npm install

# Set up environment
cp .env.example .env
# Edit .env (see Configuration below)

# Set up database
bunx prisma generate
bunx prisma db push

# Start dev server
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Ingest PDFs (optional)

```bash
# Ingest all PDFs from /upload directory
bun scripts/ingest_pdfs.ts
```

This extracts text from 30+ CoB/OAG PDF reports for full-text search.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database (SQLite for dev, PostgreSQL for production)
DATABASE_URL="file:./dev.db"
# For production: DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Admin auth
ADMIN_PASSWORD_HASH="$2b$10$zwCrCu9DgB4BvAaJUcPbPOkNnxa0HvNMBZfXH6XVqSYOl43PYkK2C"
# Default password: kenya-oversight-2026
# To set custom: generate hash with: bunx bcryptjs hash "your-password" 10
JWT_SECRET="your-jwt-secret-change-me"

# AI Assistant (optional — at least one recommended)
# Option 1: Mistral AI (get free key at https://console.mistral.ai/)
MISTRAL_API_KEY="your-mistral-api-key"
MISTRAL_MODEL="mistral-small-latest"  # or mistral-large-latest for better quality

# Option 2: z-ai-web-dev-sdk (bundled — no key needed, works out of box)
# No configuration required — automatically used as fallback

# Email notifications (optional — for finance alerts + feedback updates)
# Get free key at https://resend.com/
RESEND_API_KEY="re_your_key"
MAIL_FROM="Kenya GovDash <noreply@yourdomain.com>"
MAIL_REPLY_TO="support@yourdomain.com"

# Cron (for scheduled tasks — alert checking, email queue)
CRON_SECRET="your-cron-secret"

# Public URL (for OG images, RSS feeds, email links)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
# Production: NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

### AI Provider Selection

The AI assistant uses a 3-tier fallback:

1. **Mistral AI** (if `MISTRAL_API_KEY` is set) — best quality, free tier available
2. **z-ai-web-dev-sdk** (always available) — no configuration needed
3. **Rule-based** (always available) — hardcoded responses for common questions

---

## 📦 Deployment

### Recommended: Vercel + Turso (SQLite at edge)

**Why Vercel?** Native Next.js 16 support, automatic builds, edge functions, image optimization, PWA support.

**Why Turso?** SQLite-compatible (no Prisma schema changes), edge-replicated, free tier.

```bash
# 1. Push to GitHub (already done)

# 2. Go to vercel.com → New Project → Import from GitHub

# 3. Set environment variables in Vercel dashboard:
#    DATABASE_URL = "libsql://your-db.turso.io?authToken=your-token"
#    JWT_SECRET = "generate-random-secret"
#    ADMIN_PASSWORD_HASH = "$2b$10$..." (from bcryptjs)
#    MISTRAL_API_KEY = "your-key" (optional)
#    NEXT_PUBLIC_BASE_URL = "https://your-app.vercel.app"

# 4. Deploy — Vercel auto-detects Next.js + runs prisma generate
```

**Turso setup:**
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create kenya-govdash

# Get connection string
turso db show kenya-govdash --url
turso db tokens create kenya-govdash

# Push schema
DATABASE_URL="libsql://..." bunx prisma db push
```

### Alternative: Vercel + Supabase (PostgreSQL)

If you prefer PostgreSQL (better for complex queries + full-text search):

```bash
# 1. Create Supabase project at supabase.com

# 2. Update prisma/schema.prisma:
#    provider = "postgresql"

# 3. Set DATABASE_URL in Vercel:
#    DATABASE_URL = "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# 4. Push schema:
bunx prisma db push

# 5. Deploy to Vercel
```

### Alternative: Self-hosted (Docker)

```dockerfile
# Dockerfile
FROM oven/bun:1 as base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate
RUN bun run build
EXPOSE 3000
CMD ["bun", ".next/standalone/server.js"]
```

```bash
docker build -t kenya-govdash .
docker run -p 3000:3000 --env-file .env kenya-govdash
```

---

## 📡 API Reference

### Public APIs

| Endpoint | Method | Description |
|---|---|---|
| `/api/finance-audit` | GET | Finance + audit data (JSON/CSV). Filter: `?level=&county=&fy=&format=csv` |
| `/api/parliament` | GET | Parliament data (MPs, senators, women reps). Filter: `?type=&county=` |
| `/api/search` | GET | Site-wide search. Query: `?q=searchterm` |
| `/api/stats` | GET | Platform statistics (counts, audit distribution) |
| `/api/feedback` | GET, POST | Citizen feedback (list + submit) |
| `/api/ai-assistant` | POST | AI chat. Body: `{ question, history }` |
| `/api/finance-alerts/subscribe` | POST | Subscribe to finance alerts |
| `/api/finance-alerts/unsubscribe` | GET | Unsubscribe (`?email=`) |

### Admin APIs (require auth)

| Endpoint | Methods | Description |
|---|---|---|
| `/api/admin/login` | POST, GET | Admin authentication |
| `/api/admin/resources` | GET, POST, PATCH, DELETE | Oversight resource CRUD |
| `/api/admin/finance-audit` | GET, POST, PATCH, DELETE | Finance snapshot CRUD |
| `/api/admin/cecm-verify` | GET, POST, DELETE | CECM name verification |
| `/api/admin/extract-finance` | POST | Auto-extract finance from PDFs |
| `/api/admin/refresh-parliament` | POST | Refresh parliament data from parliament.go.ke |
| `/api/finance-alerts/check` | POST | Process pending alerts (cron-triggerable) |

### Example API calls

```bash
# Get all county finance data as CSV
curl "https://your-app.vercel.app/api/finance-audit?format=csv" -o finance.csv

# Search for "Nairobi"
curl "https://your-app.vercel.app/api/search?q=Nairobi"

# Ask AI a question
curl -X POST "https://your-app.vercel.app/api/ai-assistant" \
  -H "Content-Type: application/json" \
  -d '{"question":"Which county has the best audit opinion?"}'

# Get parliament senators
curl "https://your-app.vercel.app/api/parliament?type=senators"
```

---

## 🏗️ Architecture

```
Kenya-GovDash/
├── prisma/
│   └── schema.prisma          # Database schema (SQLite/PostgreSQL)
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (offline cache)
│   └── logo.svg               # App icon
├── scripts/
│   ├── ingest_pdfs.ts         # PDF text extraction
│   └── run_e2e.sh             # Playwright test runner
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Main dashboard (47 counties)
│   │   ├── admin/             # Admin console
│   │   ├── finance-audit/     # Finance dashboard + per-county drill-down
│   │   ├── representatives/   # Reps directory + individual profiles
│   │   ├── search/            # Site-wide search
│   │   ├── compare/           # County comparison
│   │   ├── stats/             # Platform stats
│   │   └── api/               # API routes (25+ endpoints)
│   ├── components/
│   │   ├── admin/             # Admin panels (Finance, CECM verify, etc.)
│   │   ├── kenya/             # Dashboard components (40+ panels)
│   │   └── ui/                # shadcn/ui primitives
│   └── lib/
│       ├── kenya-data.ts      # 47 counties + governors + demographics
│       ├── kenya-all-county-cecms.ts  # 440 CECM records
│       ├── finance-audit-data.ts      # Curated finance data (3 years)
│       ├── finance-extractor.ts       # PDF table parser
│       ├── finance-alerts.ts          # Alert checking + email
│       ├── mistral-ai.ts              # Mistral AI integration
│       ├── i18n.tsx                   # English + Kiswahili translations
│       └── auth.ts                   # JWT + bcrypt auth
├── upload/                    # PDF reports (CoB BIRRs, OAG audits)
└── tests/
    └── e2e/                   # Playwright tests
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL/Turso (prod) |
| Auth | JWT + bcrypt (HTTP-only cookies) |
| AI | Mistral AI SDK + z-ai-web-dev-sdk (fallback) |
| Charts | Recharts |
| PDF parsing | pdfjs-dist |
| Email | Resend |
| Testing | Vitest (unit) + Playwright (e2e) |
| PWA | manifest.json + Service Worker |

---

## 🧪 Testing

```bash
# Unit tests
bunx vitest run

# E2E tests (starts dev server automatically)
bash scripts/run_e2e.sh
```

---

## 📊 Data Sources

| Source | Abbreviation | Data Provided | URL |
|---|---|---|---|
| Office of the Auditor General | OAG | Audit opinions, pending bills | [oag.go.ke](https://oag.go.ke/) |
| Controller of Budget | CoB | Budget execution, absorption rates | [cob.go.ke](https://cob.go.ke/) |
| Council of Governors | CoG | Compliance scores, county status | [cog.go.ke](https://cog.go.ke/) |
| KNBS | KNBS | Population, demographics | [knbs.or.ke](https://www.knbs.or.ke/) |
| Parliament of Kenya | — | MPs, Senators, Women Reps | [parliament.go.ke](https://www.parliament.go.ke/) |
| IEBC | — | 2022 election results | [iebc.or.ke](https://www.iebc.or.ke/) |

All data is factual from publicly available official reports. Where data is not publicly available, fields are marked as "N/A" rather than estimated.

---

## 🔐 Security

- **Admin auth**: bcrypt password hashing + JWT in HTTP-only cookies
- **Rate limiting**: IP-based login attempt throttling
- **Whistleblower**: client-side AES-GCM 256-bit encryption (server never sees plaintext)
- **CSRF**: SameSite cookie policy
- **PWA**: Service worker excludes `/admin` routes from caching

---

## 🌍 Internationalization

The dashboard supports **English** and **Kiswahili** (Swahili). Toggle via the right sidebar language switcher.

Translation strings are in `src/lib/i18n.tsx`. To add a new language:

1. Add a new `Language` type (e.g., `'fr'`)
2. Add translations to the `translations` object
3. Add county name translations to `COUNTY_NAMES_SW`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit changes (`git commit -m 'feat: add my feature'`)
4. Push to branch (`git push origin feat/my-feature`)
5. Open a Pull Request

### Data contributions

If you have verified CECM names, audit report data, or additional county information:
- Use the admin CECM Verification panel (`/admin` → CECM Verification)
- Or submit finance data via `/admin` → Finance & Audit → Add snapshot
- Or open an issue with sourced citations

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

Data is licensed under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).

---

## 🙏 Acknowledgments

- **Office of the Auditor General** — audit opinion data
- **Controller of Budget** — budget execution + absorption rates
- **Council of Governors** — compliance scores
- **KNBS** — demographic data (2019 Census)
- **Parliament of Kenya** — MP/Senator/Woman Rep data
- **IEBC** — 2022 election results
- **Transparency International Kenya** — governance metrics

---

## 📞 Support

- **Issues**: [github.com/Devcode940/Kenya-GovDash/issues](https://github.com/Devcode940/Kenya-GovDash/issues)
- **Admin password**: `kenya-oversight-2026` (change in production!)
- **API docs**: Visit `/api/stats` for platform statistics

---

**Built for Kenya, by Kenyans, for civic accountability.**
