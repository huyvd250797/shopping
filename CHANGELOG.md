# Changelog

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

### Changed
- Chọn Supabase publishable key convention hiện tại nhưng vẫn hỗ trợ anon key legacy fallback.
- Dùng `proxy.ts` thay cho `middleware.ts` theo Next.js 16.

### Fixed
- N/A — first version.

### Known Issues
- Package installation/build chưa thể thực hiện trong môi trường tạo artifact nếu registry npm bị chặn; cần chạy các lệnh kiểm tra sau khi có network.
- Customer authentication chưa thuộc scope V0.1.0.
- Catalog public hiện là preview data, chưa nối Supabase products.
- Checkout/order routes là skeleton, chưa tạo đơn thật.
