# QA — MyShop V0.5.0

## Functional checklist
- [ ] Guest DIRECT checkout không yêu cầu login khi setting=false.
- [ ] Setting=true redirect Guest sang login.
- [ ] HYBRID direct branch checkout được; AFFILIATE-only không checkout nội bộ.
- [ ] Form bắt buộc tên/SĐT/tỉnh/huyện/xã/địa chỉ.
- [ ] Refresh form khôi phục draft.
- [ ] Review hiển thị đúng quantity/address/tổng dự kiến.
- [ ] Database re-price server-side.
- [ ] Order + item + NEW history tạo atomic.
- [ ] Success receipt cần token.
- [ ] `/orders` đọc local recent orders.
- [ ] Authenticated order gắn đúng `user_id`.
- [ ] Insufficient stock bị chặn.
- [ ] Duplicate submit không tạo duplicate order.

## Security checklist
- [ ] Không có anon INSERT policy chung cho orders/order_items.
- [ ] RPC chỉ nhận product id/qty/customer data, không nhận trusted total/status/user_id.
- [ ] Guest lookup không hoạt động chỉ với order_code.
- [ ] Không có secret thật trong repository/ZIP.

## Static QA kết quả đóng gói
- Internal alias import missing: 0.
- Page route collisions: 0.
- Page routes: 24.
- TypeScript parser: 73 TS/TSX files, 0 syntax errors.
- Gross TS/TSX brace balance: PASS.
- Migration chain: 001 → 002 → 003 → 004 → 005.
- Package version: 0.5.0.
- Local-development URL references in production guidance: 0.
- Hard-coded production secret scan: 0.
- `npm install`: không hoàn tất trong môi trường đóng gói do registry timeout; vì vậy không tuyên bố `typecheck/lint/build` thật đã PASS.
