# QA — V0.8.0 Customer Account

## Functional
- [x] Customer profile supports default shipping address.
- [x] Logged-in checkout pre-fills profile/address.
- [x] My Orders reads account orders from database by `user_id`.
- [x] My Orders supports status filter + pagination.
- [x] Customer order detail shows item snapshots, totals, address snapshot and status timeline.
- [x] Recent guest orders can be securely claimed from browser history with access token.
- [x] Admin can enable/disable guest checkout at `/admin/settings`.

## Security
- [x] Existing RLS keeps customer orders scoped to the current user.
- [x] Profile RPC does not expose role/email mutation.
- [x] Guest-order claim requires authentication + random access token.
- [x] No auto-link by phone/email.
- [x] Admin setting mutation requires Admin session and creates audit log.

## Regression
- [x] Direct Checkout still recalculates price on server.
- [x] Affiliate/Hybrid outbound flow remains unchanged.
- [x] Order Admin workflow remains unchanged.
- [x] V0.7.1 affiliate redirect narrowing is preserved.

## Packaging verification
- Static source checks are run before packaging.
- Run migration 008 before deploying source to production.

## Verification performed in packaging environment
- TypeScript/TSX transpile parser: **84 files, 0 syntax diagnostics**.
- Internal `@/` import resolver: **0 missing imports**.
- Page routes detected: **26**.
- Global TypeScript semantic check was compared against the received V0.7.x baseline without installed project dependencies: **no new non-dependency diagnostics introduced**.
- `npm install --no-audit --no-fund` was attempted, but the package registry did not respond before the environment timeout; therefore a full dependency-backed `npm run build` is **not claimed as PASS** in this package.
