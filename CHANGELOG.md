# Changelog

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
