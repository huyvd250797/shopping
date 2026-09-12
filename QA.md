# QA — V0.9.0 Hardening

## Automated/static verification completed
- [x] `npm run qa:hardening`: 22 checks PASS, 0 FAIL.
- [x] TypeScript/TSX transpile syntax parser: 99 files, 0 syntax diagnostics.
- [x] Internal `@/` import resolver: 0 missing imports.
- [x] ZIP/source contains migration 009, robots, sitemap, root/global/Admin error boundaries and hardening test plan.

## Security
- [x] Security response headers configured.
- [x] Same-origin redirect validation hardened.
- [x] SECURITY DEFINER helper `search_path` hardened in migration 009.
- [x] Runtime CREATE on `public` schema revoked.
- [x] Private/Admin routes excluded from indexing.
- [x] External Admin `_blank` links use `noopener noreferrer`.

## Duplicate prevention
- [x] Existing DB unique `checkout_request_id` preserved/reasserted.
- [x] Existing DB advisory lock/idempotent RPC remains unchanged.
- [x] Client submit lock added.
- [x] Network exception message explicitly tells user retry is safe.

## Error / performance / SEO / accessibility
- [x] Root + global + Admin error states.
- [x] Public data query failures are surfaced instead of silently becoming empty arrays.
- [x] Customer-order/catalog performance indexes included.
- [x] Request memoization added for repeated public slug/category reads.
- [x] robots/sitemap/canonical/OpenGraph/noindex rules included.
- [x] skip links, focus-visible, reduced motion and mobile input sizing included.

## Build environment note
- `npm install --no-audit --no-fund` was attempted in the packaging environment but the package registry did not respond before timeout.
- Therefore dependency-backed `npm run typecheck`, `npm run lint` and `npm run build` are **not claimed as PASS** here. Run all three in CI/Vercel/local with installed dependencies before promoting to V1.0.0.

See `HARDENING_TEST_PLAN.md` for end-to-end Release Candidate scenarios.
