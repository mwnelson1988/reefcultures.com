# ReefCultures — SpaceX/Apple Investor Build (Supabase Auth Complete)

## What’s included
- SpaceX/Apple-style structure + motion (Framer Motion)
- Supabase Auth (email/password) with cookie sessions
- Protected /account route (middleware + server check)
- Stripe Checkout (server-side session creation)
- Stripe webhook endpoint scaffold

## Local run
1) npm install
2) Copy .env.example → .env.local and fill keys
3) npm run dev

## Supabase setup
- In Supabase Dashboard → Authentication:
  - Enable Email/Password provider
  - Optional: disable email confirmations for immediate login during testing

## Vercel deploy
- Add same .env vars in Vercel Project → Environment Variables
- Deploy

## Routes
- /login, /signup
- /account (protected)
- /store and /store/[slug]
