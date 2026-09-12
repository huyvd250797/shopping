import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const dbUrl = process.env.SUPABASE_DB_URL?.trim();
if (!dbUrl) {
  console.error("Thiếu SUPABASE_DB_URL. Dùng connection string Postgres production và không commit giá trị này.");
  process.exit(1);
}

const backupDir = path.resolve(process.cwd(), "backups");
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = path.join(backupDir, `myshop-${stamp}.dump`);

const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--no-privileges", "--file", file], {
  stdio: "inherit",
  env: { ...process.env, PGDATABASE: dbUrl },
});

if (result.error?.code === "ENOENT") {
  console.error("Không tìm thấy pg_dump. Hãy cài PostgreSQL client tools trước khi chạy backup.");
  process.exit(1);
}
if (result.status !== 0) {
  console.error("Backup thất bại. File chưa được xác nhận hợp lệ.");
  process.exit(result.status || 1);
}

const stat = fs.statSync(file);
if (stat.size < 1024) {
  console.error("Backup quá nhỏ, cần kiểm tra lại trước khi sử dụng.");
  process.exit(1);
}

console.log(`Backup hoàn tất: ${file}`);
console.log(`Dung lượng: ${stat.size} bytes`);
console.log(`Kiểm tra bằng: npm run backup:verify -- "${file}"`);
