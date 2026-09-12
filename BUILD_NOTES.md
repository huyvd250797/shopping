# Build Notes — V0.9.0

- Base source received: **MyShop V0.8.0 — Customer Account**.
- Roadmap target: **V0.9.0 — Hardening**.
- New database migration: `202609120009_hardening.sql`.
- No new npm dependency added.
- Production URL remains `https://bobebunne.vercel.app`.

## Main changes

- Security headers + CSP baseline and hardened internal redirect validation.
- Hardened `is_admin` / `handle_new_user` SECURITY DEFINER functions.
- Database indexes for customer-order and catalog common query paths.
- Root/Admin/public query error recovery states.
- Client + DB duplicate-order safeguards.
- robots/sitemap/canonical/OpenGraph/noindex rules.
- Accessibility: skip links, focus-visible, reduced motion, mobile input sizing.
- Added `npm run qa:hardening` and Release Candidate hardening test plan.

## Next roadmap

**V1.0.0 — Production Ready**: production environment review, domain/logging/backup, final QA, seed/settings verification and release sign-off.
