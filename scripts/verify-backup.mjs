import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const input = process.argv[2];
if (!input) {
  console.error('Cách dùng: npm run backup:verify -- "backups/myshop-YYYY-MM-DD.dump"');
  process.exit(1);
}

const file = path.resolve(process.cwd(), input);
if (!fs.existsSync(file)) {
  console.error(`Không tìm thấy backup: ${file}`);
  process.exit(1);
}

const result = spawnSync("pg_restore", ["--list", file], { encoding: "utf8" });
if (result.error?.code === "ENOENT") {
  console.error("Không tìm thấy pg_restore. Hãy cài PostgreSQL client tools.");
  process.exit(1);
}
if (result.status !== 0 || !result.stdout?.trim()) {
  console.error("Backup không đọc được bằng pg_restore --list.");
  if (result.stderr) console.error(result.stderr.trim());
  process.exit(result.status || 1);
}

const entries = result.stdout.split("\n").filter((line) => line && !line.startsWith(";")).length;
console.log(`Backup hợp lệ ở mức catalog: ${file}`);
console.log(`Catalog entries: ${entries}`);
console.log("Lưu ý: kiểm tra restore định kỳ trên database staging vẫn là bước bắt buộc.");
