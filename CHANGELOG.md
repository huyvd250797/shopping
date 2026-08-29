# Changelog

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
