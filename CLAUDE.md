@AGENTS.md

# BSC Tool (bsc.demospace.online)

Balanced Scorecard SaaS — free tier (1 AI generation) + paid tier (unlimited AI, PDF export, strategy map). Built with Next.js App Router, PostgreSQL, Anthropic Claude API, Stripe, Tailwind CSS 4. Runs on port 3002 in production (PM2).

## Project Structure

```
app/
  ├── page.tsx              # Homepage / session redirect
  ├── bsc/                  # Main BSC tool (list, [id], new, recover)
  ├── admin/                # Admin dashboard
  ├── privacy/ terms/       # Legal pages
  └── api/
      ├── ai/generate/      # Claude AI generation endpoint
      ├── sessions/         # User session CRUD + recovery
      ├── objectives/       # BSC objectives CRUD
      ├── kpis/             # KPI CRUD + entries
      ├── initiatives/      # Initiative CRUD
      ├── links/            # Link CRUD
      ├── payment/          # Checkout flow
      ├── stripe/           # Stripe checkout + webhook
      └── cron/nudge-emails/ # Scheduled email reminders
lib/
  ├── db.ts                 # PostgreSQL connection pool
  ├── bsc-db.ts             # BSC domain queries
  ├── auth.ts               # Auth utilities
  ├── email.ts              # Resend email functions
  └── i18n.ts               # Internationalisation
types/bsc.ts                # All BSC domain TypeScript types
public/fonts/               # Noto Sans + Noto Sans Georgian (woff2 + ttf)
```

## Organization Rules

- API routes → `app/api/`, one folder per resource, `route.ts` inside
- DB queries → `lib/bsc-db.ts`, not inline in routes
- Shared types → `types/bsc.ts`
- Components → create `components/` if needed, one component per file

## Code Quality

After editing any file:

```bash
npm run lint        # ESLint — fix all errors/warnings
npm run build       # TypeScript typecheck + build
```

Fix ALL errors before continuing.

If server restart needed (non-hot-reloadable changes):
```bash
pm2 restart bsc-app && pm2 logs bsc-app --lines 30
```
