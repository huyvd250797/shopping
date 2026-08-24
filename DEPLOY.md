# Deploy — MyShop V0.2.0

## Vercel

1. Push source lên GitHub.
2. Import repository vào Vercel.
3. Framework Preset: Next.js.
4. Output Directory: để trống / mặc định (`.next`).
5. Thêm env từ `.env.example`.
6. Set `NEXT_PUBLIC_SITE_URL=https://your-domain`.
7. Deploy.

## Supabase

Nếu nâng từ V0.1.0, chạy:

```text
supabase/migrations/202608240002_auth_roles.sql
```

Sau đó Authentication → URL Configuration:

- Site URL = domain production.
- Redirect URLs thêm `https://your-domain/auth/callback`.
- Nếu dùng Vercel Preview để test email callback, thêm preview domain phù hợp.

## Smoke test sau deploy

- Public home mở không cần login.
- Register customer.
- Email confirmation quay lại đúng domain.
- Login/logout.
- Update profile.
- Forgot password + update password.
- Customer thường không vào được `/admin`.
- Admin seed account vào được `/admin`.
