# Build Notes — V0.7.0

- Base source: MyShop V0.6.1 — Order Admin Type Fix.
- No new npm dependency.
- Database migration: `202608290007_affiliate_hybrid.sql`.
- Production URL remains `https://bobebunne.vercel.app`.
- Public affiliate redirects are server-controlled by `/go/[slug]` + database RPC.
- Direct Checkout and Order Admin behavior are intentionally unchanged.
