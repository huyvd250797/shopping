# Deploy — MyShop V0.3.0

Production domain đang dùng:

`https://bobebunne.vercel.app`

## 1. Supabase migration

Nếu database đã chạy V0.1.0 và V0.2.0, chạy thêm file sau trong Supabase SQL Editor:

`supabase/migrations/202608240003_catalog_cms.sql`

Migration này bổ sung field catalog, index, `storage_path`, tạo bucket `product-images` và Storage RLS cho Admin.

Nếu tạo database mới từ đầu, chạy theo đúng thứ tự:

1. `202608240001_foundation.sql`
2. `202608240002_auth_roles.sql`
3. `202608240003_catalog_cms.sql`
4. `supabase/seed.sql`
5. `npm run seed:admin`

## 2. Supabase Authentication URL

Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://bobebunne.vercel.app`
- Redirect URL: `https://bobebunne.vercel.app/auth/callback`

## 3. Vercel Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxx
ADMIN_SEED_EMAIL=your-admin-email
ADMIN_SEED_PASSWORD=your-strong-password
ADMIN_SEED_NAME=Administrator
```

Nếu project dùng key legacy, có thể dùng `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY` thay cho hai key mới tương ứng.

## 4. Vercel build

- Framework Preset: Next.js
- Build Command: `npm run build` hoặc mặc định
- Output Directory: **để trống**, không nhập `out`
- Install Command: mặc định `npm install`

Sau khi thêm/sửa Environment Variables, Redeploy project.

## 5. Smoke test production

1. Mở `https://bobebunne.vercel.app` không cần login.
2. Vào `/admin/login` bằng Admin.
3. Tạo một danh mục.
4. Tạo sản phẩm DIRECT ở trạng thái Active.
5. Upload ít nhất một ảnh và đặt làm thumbnail.
6. Mở public Home và product detail để xác nhận dữ liệu phản ánh đúng.
7. Tạo sản phẩm AFFILIATE với URL hợp lệ + custom button label, kiểm tra CTA mở đúng link.
8. Tạo HYBRID và kiểm tra cả Direct CTA lẫn Affiliate CTA.
9. Ẩn sản phẩm → public không còn thấy; bật lại → public thấy lại.
10. Xóa mềm → public không thấy; khôi phục → về Draft.
