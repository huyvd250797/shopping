# Build Notes — V0.8.0

- Base source received: V0.7.x codebase (includes V0.7.1 affiliate redirect hotfix).
- Roadmap target: V0.8.0 — Customer Account.
- New database migration: `202609120008_customer_account.sql`.
- No new npm dependency added.
- Production URL remains `https://bobebunne.vercel.app`.

## Main changes

- Customer profile now stores a default shipping address.
- My Orders list/detail is fully implemented.
- Secure browser-history order sync claims guest orders only with `access_token`.
- Direct Checkout pre-fills customer profile/address.
- Admin Settings now controls `require_login_for_checkout`.
- Version metadata updated consistently to V0.8.0.

## Next roadmap

V0.9.0 — Hardening: security pass, error states, duplicate prevention review, performance, SEO, accessibility and release-candidate test scenarios.
