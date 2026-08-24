import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD;
const fullName = process.env.ADMIN_SEED_NAME || "Administrator";

if (!url || !serverKey || !email || !password) {
  console.error("Thiếu biến môi trường. Cần NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY (hoặc SERVICE_ROLE_KEY), ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD.");
  process.exit(1);
}

if (password.length < 10) {
  console.error("ADMIN_SEED_PASSWORD nên có ít nhất 10 ký tự.");
  process.exit(1);
}

const supabase = createClient(url, serverKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail);
    if (found) return found;
    if (data.users.length < 100) return null;
    page += 1;
  }
  return null;
}

async function main() {
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Đã tạo Auth user: ${email}`);
  } else {
    console.log(`Auth user đã tồn tại: ${email}`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email,
    full_name: fullName,
    role: "admin",
  });
  if (profileError) throw profileError;

  console.log("Đã gán role=admin trong public.profiles.");
  console.log("Seed Admin hoàn tất. Có thể đăng nhập tại /admin/login");
}

main().catch((error) => {
  console.error("Seed Admin thất bại:", error.message || error);
  process.exit(1);
});
