# QA — V0.7.0 Affiliate & Hybrid

## Functional
- [x] AFFILIATE CTA uses `/go/[slug]`.
- [x] HYBRID Direct CTA still uses `/checkout/[slug]`.
- [x] HYBRID Affiliate CTA uses `/go/[slug]`.
- [x] Missing/invalid Affiliate URL has safe fallback.
- [x] Admin Affiliate Analytics route added.
- [x] Dashboard Affiliate KPI added.

## Database / Security
- [x] RPC validates active + non-deleted + mode + URL before redirect.
- [x] RPC uses `SECURITY DEFINER` with fixed `search_path`.
- [x] RPC EXECUTE limited to anon/authenticated as intended.
- [x] Admin analytics RPC checks `is_admin()`.
- [x] Duplicate suppression window: 10 seconds per product/user or product/session.
- [x] No IP storage added.
- [x] Affiliate event does not create an order.

## Packaging
- Static TypeScript/TSX parse and internal-import scan performed before packaging.
- Full dependency build is reported separately based on environment availability.

## Tool verification
- TypeScript transpile parser: 79 TS/TSX files, 0 syntax diagnostics.
- Internal `@/` import resolver: 0 missing imports.
- Page routes: 25, 0 collisions.
- `npm install` was attempted but the package registry did not respond before the environment timeout; therefore a full dependency-backed `npm run build` is **not** claimed as PASS in this package.
