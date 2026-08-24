# MyShop V0.2.0 — Auth & Roles

Phiên bản thứ hai theo blueprint **Web App Bán Hàng Affiliate + Đơn Hàng**. V0.2.0 kế thừa V0.1.0 Foundation và tập trung hoàn thiện xác thực/phân quyền trước khi bước vào Catalog CRUD.

## 1. Version history

- ✅ V0.1.0 — Foundation
- ✅ **V0.2.0 — Auth & Roles (current)**
- ➡️ V0.3.0 — Catalog & CMS Core

## 2. Scope V0.2.0 đã build

- Customer signup/login/logout.
- Email confirmation callback.
- Forgot password → email recovery → đặt mật khẩu mới.
- Protected Account route.
- Profile cơ bản: họ tên, số điện thoại, email read-only.
- Header nhận biết session.
- Admin login + server role guard tiếp tục được giữ nguyên.
- RLS own-profile và own-orders.
- RPC `update_my_profile` chỉ cho chỉnh allow-list field, không cho đổi role.
- Guest vẫn xem public site bình thường; đăng nhập không trở thành bắt buộc để duyệt sản phẩm.

**Chưa build đúng roadmap:** Catalog CRUD thật (V0.3), Home/Search hoàn thiện (V0.4), Checkout (V0.5), Order Admin (V0.6), Affiliate tracking (V0.7), account/order UI đầy đủ (V0.8).

## 3. Yêu cầu

- Node.js >= 20.9
- npm
- Supabase project

## 4. Cài local

```bash
npm install
cp .env.example .env.local
```

Windows: tạo `.env.local` thủ công cạnh `package.json` rồi copy nội dung `.env.example`.

Điền tối thiểu:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=...
ADMIN_SEED_EMAIL=...
ADMIN_SEED_PASSWORD=...
```

## 5. Database migration

Nếu project Supabase **mới hoàn toàn**:

1. Chạy `supabase/migrations/202608240001_foundation.sql`
2. Chạy `supabase/migrations/202608240002_auth_roles.sql`
3. Chạy `supabase/seed.sql`
4. Chạy `npm run seed:admin`

Nếu Supabase của bạn đã chạy V0.1.0 trước đó, chỉ cần chạy migration mới:

```text
supabase/migrations/202608240002_auth_roles.sql
```

## 6. Supabase Auth URL bắt buộc

Trong Supabase Dashboard → Authentication → URL Configuration:

- Site URL local: `http://localhost:3000`
- Redirect URL local nên cho phép: `http://localhost:3000/auth/callback`
- Khi deploy Vercel, thêm domain Preview/Production tương ứng.

Nếu URL này sai, signup vẫn có thể tạo user nhưng email confirmation/password recovery sẽ quay về sai domain.

## 7. Routes V0.2.0

- `/login` — Customer Login
- `/register` — Customer Signup
- `/forgot-password` — Request reset email
- `/auth/callback` — Supabase code exchange
- `/auth/update-password` — Set new password
- `/account` — Protected profile
- `/account/orders` — Protected placeholder + RLS-ready
- `/admin/login` — Admin login
- `/admin` — Admin protected

## 8. Test matrix nhanh

### Customer Auth

1. Mở `/register`, tạo account.
2. Nếu Supabase bật Confirm Email: mở email → click link → về `/account`.
3. Logout → `/login` → login lại.
4. Vào `/account` sửa họ tên/SĐT → refresh vẫn còn dữ liệu.
5. `/forgot-password` → email → đặt password mới.

### Authorization

1. Logout rồi mở `/account` → phải về `/login`.
2. Customer thường mở `/admin` → phải bị từ chối/đưa về Admin Login.
3. Customer không thể đổi `profiles.role` qua RPC profile.
4. Customer chỉ được đọc order có `user_id = auth.uid()` theo RLS.

## 9. Guest checkout policy

`supabase/seed.sql` vẫn giữ:

```text
require_login_for_checkout = false
```

Nghĩa là định hướng sản phẩm vẫn là **khách không cần đăng nhập vẫn có thể đặt hàng** khi Direct Checkout được build ở V0.5.0. Account là tính năng tăng tiện ích, không phải rào cản mua hàng.

## 10. Chạy và kiểm tra

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## 11. Deploy Vercel

- Framework: Next.js
- Build command: mặc định / `npm run build`
- Output Directory: **để trống**, không nhập `out`
- Thêm toàn bộ env cần thiết.
- `NEXT_PUBLIC_SITE_URL` phải là domain thật.
- Thêm domain `/auth/callback` vào Supabase Redirect URLs.

## 12. Security notes

- Password do Supabase Auth quản lý; app không lưu plaintext password.
- `role` không được phép nằm trong form profile update.
- Customer profile update dùng RPC allow-list.
- Admin guard chạy server-side.
- RLS là lớp bảo vệ database, không phụ thuộc việc menu có bị ẩn hay không.
- `SUPABASE_SECRET_KEY`/service-role tuyệt đối không có prefix `NEXT_PUBLIC_`.

## 13. Phiên bản tiếp theo

**V0.3.0 — Catalog & CMS Core**: categories/products/images, Admin CRUD, publish/archive, Purchase Mode + Affiliate URL + button label, public catalog đọc Supabase thật.
