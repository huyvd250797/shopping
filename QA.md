# QA — MyShop V0.6.0

## Functional checklist
- [ ] `/admin/orders` search theo mã đơn/tên/SĐT.
- [ ] Filter status hoạt động.
- [ ] Filter Guest/Customer hoạt động.
- [ ] Filter date from/to theo ngày vận hành Việt Nam.
- [ ] Pagination giữ nguyên query filter.
- [ ] NEW → CONFIRMED thành công.
- [ ] CONFIRMED → PROCESSING thành công.
- [ ] PROCESSING → SHIPPING thành công.
- [ ] SHIPPING → COMPLETED thành công.
- [ ] COMPLETED → ARCHIVED thành công.
- [ ] CANCELLED chỉ cho phép từ NEW/CONFIRMED/PROCESSING/SHIPPING.
- [ ] CANCELLED bắt buộc lý do.
- [ ] ARCHIVED không còn transition tiếp theo.
- [ ] Mỗi transition tạo status history + audit.
- [ ] Internal note lưu/reload đúng và có audit.
- [ ] Copy mã đơn/SĐT/địa chỉ hoạt động trên HTTPS production.
- [ ] `/admin/audit` hiển thị order audit và link detail.

## Security checklist
- [ ] Customer/Guest không execute được Order Admin RPC.
- [ ] Generic direct UPDATE `orders` qua client bị RLS chặn.
- [ ] Direct INSERT `order_status_history` qua client bị RLS chặn.
- [ ] RPC pin `search_path` và chỉ grant `authenticated`.
- [ ] RPC tự check `public.is_admin()`.
- [ ] Không có secret thật trong repository/ZIP.

## Static QA kết quả đóng gói
- TypeScript parser: **75 TS/TSX files, 0 syntax errors**.
- Internal import missing: **0**.
- Page routes: **24**.
- Page route collisions: **0**.
- Direct order table mutations trong `src`: **0**; V0.6.0 mutation dùng RPC.
- Migration chain: **001 → 002 → 003 → 004 → 005 → 006**.
- Package version: **0.6.0**.
- Local-development URL references: **0**.
- Production domain: `https://bobebunne.vercel.app`.
- Hard-coded production secret scan: **0**.
- `npm install`: package registry không phản hồi trong giới hạn thời gian của môi trường đóng gói; vì vậy không tuyên bố `typecheck/lint/build` dependency-level đã PASS.
