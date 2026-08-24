# Changelog

## [0.2.0] - 2026-08-24

### Added
- Customer signup bằng Supabase Auth.
- Customer login/logout với cookie session SSR.
- Email confirmation callback `/auth/callback`.
- Forgot-password + recovery callback + update-password flow.
- Protected `/account` và `/account/orders` route.
- Customer profile UI: full name + phone; email read-only.
- Safe `update_my_profile` RPC không cho client sửa `role`/email.
- Header thay đổi theo session: login hoặc account/logout.
- RLS customer read own `orders`, `order_items`, `order_status_history`.
- Migration `202608240002_auth_roles.sql`.

### Changed
- Version badge → V0.2.0 • Auth & Roles.
- Auth metadata bootstrap nhận `full_name` + `phone`.
- Admin login copy cập nhật theo version hiện tại.
- `/account/orders` được bảo vệ session dù UI orders đầy đủ vẫn thuộc V0.8.0.

### Security
- Customer profile edit đi qua SECURITY DEFINER RPC với field allow-list.
- Không có generic customer UPDATE trên `profiles`, tránh role escalation.
- Customer order policies scope theo `auth.uid()`; không đọc order user khác.
- Auth callback `next` chỉ cho internal path, tránh open redirect.

### Known Issues
- CRUD catalog vẫn là placeholder/previews cho đến V0.3.0.
- Direct Checkout chưa tạo đơn thật cho đến V0.5.0.
- Account address book và My Orders UI hoàn chỉnh thuộc V0.8.0.
- Cần cấu hình Supabase Auth Site URL / Redirect URLs đúng domain local/preview/production để email confirmation và password recovery hoạt động.

## [0.1.0] - 2026-08-24

### Added
- Next.js/TypeScript/Tailwind project foundation.
- Marketplace-inspired responsive public shell.
- Public route skeletons theo blueprint.
- Supabase SSR client/server/proxy foundation.
- Admin Supabase login + server-side role guard.
- Responsive Admin Console skeleton.
- Core relational database schema.
- RLS foundation and admin bootstrap helper.
- Non-sensitive site settings seed.
- README local/deploy/security instructions.
