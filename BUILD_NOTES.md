# Build Notes — V0.4.0

- Source nâng trực tiếp từ MyShop V0.3.0 user cung cấp.
- Không thay đổi business boundary của Auth, Catalog, Purchase Mode.
- Migration mới: `202608240004_home_search_ux.sql`.
- Banner media upload trực tiếp browser → Supabase Storage `site-media` để tránh Vercel Function body limit.
- Banner `datetime-local` được server hiểu theo múi giờ Việt Nam `+07:00`.
- Public filter state được lưu bằng GET query URL, không cần client state library.
- V0.4.0 không insert `orders`/`order_items`; Direct Checkout giữ cho V0.5.0.
