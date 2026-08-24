# QA — V0.2.0 Auth & Roles

## Automated/static checks performed in artifact environment

- TS/TSX syntax transpile check: PASS.
- Internal `@/` import resolution check: PASS.
- Public/Admin/Auth route collision review: PASS.
- Version package/config/docs consistency: PASS.
- Secret scan: no real `.env.local` or credential values included.
- Migration order present: `001_foundation` → `002_auth_roles` → seed.

## Build limitation of artifact environment

`npm install` was attempted but registry access timed out, so `node_modules` could not be installed here. Therefore `npm run typecheck`, `npm run lint`, and `npm run build` cannot be considered a real dependency-backed PASS in this environment.

Run after downloading:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## Manual smoke tests after Supabase setup

1. Register customer.
2. Confirm email callback.
3. Login/logout.
4. Update profile.
5. Forgot-password flow.
6. Customer denied `/admin`.
7. Seed Admin accepted `/admin`.
8. Guest can still open Home/Search/Product routes without login.
