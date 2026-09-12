# Changelog

## V0.9.0 — Hardening

### Added
- Global/root/Admin error boundaries and Admin loading state with retry/recovery UX.
- Security response headers: CSP baseline, nosniff, frame deny, strict referrer policy, permissions policy and HSTS.
- `robots.txt` + dynamic `sitemap.xml`; Product/Category canonical + OpenGraph metadata; private/search routes noindex.
- Keyboard skip links, focus-visible styling, reduced-motion support and mobile 16px form controls.
- Request-scoped cache for public category/product slug lookups.
- Hardening migration `202609120009_hardening.sql` with security-definer/search_path fixes and query indexes.
- Dependency-free `npm run qa:hardening` source guard and `HARDENING_TEST_PLAN.md`.

### Changed
- Public catalog/home query failures now surface through error boundaries instead of silently looking like empty data.
- Admin dashboard marks V0.9.0 Ready and V1.0.0 Production Ready as the next roadmap step.
- Version metadata normalized to V0.9.0.

### Security
- Internal post-login redirect helper now validates same-origin URL semantics and rejects backslash/network-path escapes.
- Checkout adds a client-side submit lock in addition to the existing database idempotency key.
- Existing `checkout_request_id` unique index is reasserted by migration 009.
- `public.is_admin()` and `public.handle_new_user()` now use an empty `search_path` with fully qualified tables.
- Runtime roles lose schema CREATE privileges in `public`.
- Existing Admin links opened in a new tab now use `noopener noreferrer`.

### Performance
- Add indexes for `orders(user_id, created_at)`, `orders(user_id, status, created_at)`, active catalog category/sort and active price paths.
- Request memoization avoids duplicate category/product slug reads within one render request.

### Database
- Add migration `202609120009_hardening.sql`.

## V0.8.0 — Customer Account

### Added
- Customer profile default shipping address: province, district, ward, address line.
- Customer order list with status filter and pagination at `/account/orders`.
- Customer order detail with item snapshots, shipping snapshot, totals and status timeline.
- Secure browser-history sync: guest orders can be claimed only with `order_code + access_token`.
- Admin Guest Checkout policy control at `/admin/settings`.
- Customer account order KPI summary.

### Changed
- Direct Checkout pre-fills profile and default address for authenticated customers.
- Account copy/UI updated from V0.2 placeholder state to completed V0.8.0 flow.
- Admin dashboard roadmap marks Customer Account as Ready and V0.9.0 Hardening as Next.
- Version metadata normalized to V0.8.0 across package/site/docs.

### Security
- Customer profile update RPC never accepts role/email fields.
- Guest-order sync requires authenticated user and the random order access token; no phone/email-only linking.
- Customer order detail remains protected by existing user-scoped RLS plus explicit `user_id` filtering.
- Admin Guest Checkout setting change is Admin-only and creates an audit record.

### Database
- Add migration `202609120008_customer_account.sql`.

## V0.7.1 — Affiliate Redirect Type Fix

### Fixed
- Fix Vercel/TypeScript build error TS2345 in `src/app/go/[slug]/route.ts`.
- Explicitly narrow `target_url` from `string | null` to `string` before redirect.
- Build a validated `URL` object before calling `NextResponse.redirect(...)`.

### Database
- No new migration. Database remains at migration 007.

## V0.7.0 — Affiliate & Hybrid

### Added
- Tracked outbound route `/go/[slug]` for Affiliate/Hybrid CTA.
- Database RPC `record_affiliate_click(...)` with product/mode/status/URL validation.
- Anonymous affiliate session cookie and 10-second duplicate-click suppression.
- `source_path` tracking for affiliate click events.
- Admin Affiliate Analytics at `/admin/affiliate`.
- KPI: clicks today, clicks by period, unique visitors, active affiliate products.
- Per-product click/visitor stats and recent-click table.
- Dashboard Affiliate KPI and sidebar navigation.
- SQL URL safety constraint for new/updated affiliate URLs.

### Changed
- Public Affiliate and Hybrid outbound buttons no longer link directly to the partner URL; they go through `/go/[slug]` first.
- Product detail shows a safe fallback message when an outbound link is unavailable.
- Version metadata updated to V0.7.0.

### Security
- Affiliate tracking uses a `SECURITY DEFINER` RPC with fixed `search_path` and explicit EXECUTE grants.
- Only active, non-deleted AFFILIATE/HYBRID products with valid http/https URLs may redirect.
- No IP address is stored for affiliate analytics.
- Affiliate clicks never create orders or count as internal sales.

### Database
- Add migration `202608290007_affiliate_hybrid.sql`.
