# Deploy MyShop V0.7.1 — Production

Production domain: **https://bobebunne.vercel.app**

## 1. Nâng database từ V0.6.x

Trong **Supabase → SQL Editor**, chạy toàn bộ file:

`supabase/migrations/202608290007_affiliate_hybrid.sql`

Chỉ chạy migration 007 khi database production đã có migration 001 → 006.

Migration 007 bổ sung:
- `affiliate_clicks.source_path`
- indexes cho affiliate analytics
- `is_valid_affiliate_url(...)`
- `record_affiliate_click(...)`
- `admin_affiliate_kpis(...)`
- `admin_affiliate_product_stats(...)`
- constraint URL affiliate cho dữ liệu mới/cập nhật

## 2. Environment Variables trên Vercel

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Không có biến môi trường hoặc migration mới bắt buộc cho V0.7.1.

## 3. Deploy source

Push source lên GitHub/Vercel theo quy trình hiện tại. Không cấu hình Output Directory thành `out`; để Vercel/Next.js dùng `.next` mặc định.

## 4. Smoke test Affiliate

1. Admin tạo/sửa một sản phẩm `AFFILIATE`, URL `https://...`, trạng thái Active.
2. Mở trang sản phẩm public và bấm CTA Affiliate.
3. Browser mở `/go/[slug]` rồi redirect sang URL đối tác.
4. Vào `/admin/affiliate`: số click phải tăng.
5. Bấm lặp lại cùng sản phẩm trong <10 giây: vẫn redirect nhưng không tăng click liên tục.
6. Sản phẩm HYBRID phải giữ cả Direct Checkout và Affiliate CTA.
7. Affiliate URL sai/không khả dụng phải quay về trang sản phẩm với cảnh báo, không redirect ra URL không hợp lệ.
8. Customer/Guest không truy cập được `/admin/affiliate`.
