# QA — MyShop V0.3.0

## Catalog Admin
- [ ] Admin tạo được danh mục và public đọc được danh mục Active.
- [ ] Danh mục Inactive biến mất ngoài public.
- [ ] Không xóa được danh mục đang có sản phẩm.
- [ ] Admin tạo DIRECT có giá và publish được.
- [ ] AFFILIATE thiếu URL bị chặn.
- [ ] Affiliate URL không phải http/https bị chặn.
- [ ] HYBRID lưu được Direct + Affiliate CTA.
- [ ] Slug/SKU trùng hiển thị lỗi thân thiện.
- [ ] Draft không xuất hiện public.
- [ ] Active xuất hiện public.
- [ ] Xóa mềm loại sản phẩm khỏi public nhưng không hard-delete record.
- [ ] Restore đưa sản phẩm về Draft.

## Images
- [ ] Upload JPG/PNG/WEBP/GIF <= 5MB thành công.
- [ ] File không phải ảnh bị từ chối.
- [ ] File > 5MB bị từ chối.
- [ ] Customer không có quyền ghi bucket `product-images`.
- [ ] Ảnh đầu tiên tự thành thumbnail nếu sản phẩm chưa có thumbnail.
- [ ] Admin đổi thumbnail được.
- [ ] Xóa image record đồng thời xóa Storage object nếu có `storage_path`.

## Public
- [ ] Home đọc category + product từ Supabase.
- [ ] Category route chỉ hiển thị Active product.
- [ ] Basic Search tìm theo name/SKU/short description.
- [ ] Product detail 404 với Draft/Archived/deleted product.
- [ ] DIRECT CTA đi `/checkout/[slug]`.
- [ ] AFFILIATE CTA mở URL ngoài.
- [ ] HYBRID có 2 CTA khi Affiliate URL hợp lệ.

## Regression
- [ ] Register/login/logout Customer V0.2.0 còn hoạt động.
- [ ] Customer không vào `/admin`.
- [ ] Admin login/guard còn hoạt động.
- [ ] Account/profile update còn hoạt động.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` không có blocker.
