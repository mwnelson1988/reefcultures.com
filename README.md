# Reefcultures Starter Site (Next.js + Supabase Auth + Stripe Checkout)

This is a drag-and-drop starter you can open in VS Code, run locally, then deploy to Hostinger using their Node.js Web App Hosting.

## 1) Requirements
- Node.js 20+
- A Supabase project (for Sign in / Sign up)
- A Stripe account (for Checkout)

## 2) Local setup (VS Code)
1. Install deps:
   - `npm install`
2. Create `.env.local` (copy from `.env.example`)
3. Run dev:
   - `npm run dev`
4. Open:
   - http://localhost:3000

## 3) Supabase setup
- Create a new project
- Go to Authentication → Providers → Email (enable)
- Copy:
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - Anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4) Stripe setup
- Create a Stripe account
- Grab your secret key:
  - Developers → API keys → Secret key
- Put into:
  - `STRIPE_SECRET_KEY`

## 5) Deploy to Hostinger
Recommended: Hostinger Node.js Web App Hosting (Business/Cloud plans).
- Connect your GitHub repo OR upload files, then Hostinger will build and deploy automatically.

Environment variables must be added inside Hostinger (or imported with an .env file if your plan supports it).

---
Need these next?
- Real product catalog (from Stripe Products or a CMS)
- Order history saved to Supabase via Stripe webhooks
- A working Contact form (email delivery + spam protection)

## 6) Free analytics (recommended)
### Google Analytics 4 (GA4)
- Create a GA4 property and get your Measurement ID (G-XXXXXXXXXX)
- Add env var: `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Microsoft Clarity (free heatmaps + session recordings)
- Create a Clarity project and copy the Project ID
- Add env var: `NEXT_PUBLIC_CLARITY_ID`
