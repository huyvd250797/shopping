# Build Notes — V0.5.0

V0.5.0 nâng trực tiếp từ V0.4.0 và giữ nguyên Auth/Roles, Catalog/CMS, Home/Search.

Điểm kiến trúc chính: tạo order bằng PostgreSQL `SECURITY DEFINER` RPC để hỗ trợ Guest mà không mở generic RLS INSERT cho anon. Function là transaction boundary nên order header/item/status history cùng commit hoặc cùng rollback.

`checkout_request_id` làm idempotency key. `access_token` dùng để Guest xem receipt an toàn mà không dựa vào order code dễ chia sẻ.

Production URL dùng xuyên suốt: `https://bobebunne.vercel.app`.

Build limitation: `npm install` timed out against the package registry in the packaging environment, so full dependency typecheck/lint/build was not claimed. TypeScript global parser successfully parsed all 73 TS/TSX source files with 0 syntax errors.
