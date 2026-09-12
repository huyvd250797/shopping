import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const passes = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
function expect(label, condition) {
  if (condition) passes.push(label);
  else failures.push(label);
}
function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const pkg = JSON.parse(read("package.json"));
expect("package version is V0.9.0 or later", ["0.9.0", "1.0.0"].includes(pkg.version));
const siteVersion = read("src/config/site.ts");
expect("site version label is Hardening or later", siteVersion.includes("V0.9.0 • Hardening") || siteVersion.includes("V1.0.0 • Production Ready"));

const nextConfig = read("next.config.ts");
for (const header of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security"]) {
  expect(`security header: ${header}`, nextConfig.includes(header));
}

for (const rel of [
  "src/app/error.tsx",
  "src/app/global-error.tsx",
  "src/app/admin/(protected)/error.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "supabase/migrations/202609120009_hardening.sql",
]) {
  expect(`required hardening file: ${rel}`, exists(rel));
}

const migration = read("supabase/migrations/202609120009_hardening.sql");
expect("checkout idempotency index is preserved", migration.includes("idx_orders_checkout_request_id"));
expect("public schema CREATE is revoked", migration.includes("revoke create on schema public"));
expect("SECURITY DEFINER search_path hardened", migration.includes("set search_path = ''"));

const redirectGuard = read("src/lib/auth/redirect.ts");
expect("internal redirect guard validates URL origin", redirectGuard.includes("url.origin !== INTERNAL_ORIGIN"));

const checkout = read("src/components/shop/checkout-form.tsx");
expect("checkout has client submit lock", checkout.includes("submitLockRef"));
expect("checkout exposes error to assistive technology", checkout.includes('role="alert"'));

const robots = read("src/app/robots.ts");
expect("private/admin routes are excluded from crawling", ["/admin/", "/account/", "/checkout/", "/order/"].every((route) => robots.includes(route)));

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) sourceFiles.push(full);
  }
}
walk(path.join(root, "src"));

for (const full of sourceFiles) {
  const text = fs.readFileSync(full, "utf8");
  const rel = path.relative(root, full);
  for (const match of text.matchAll(/<[^>]+target=["']_blank["'][^>]*>/g)) {
    if (!/rel=["'][^"']*noopener/.test(match[0])) {
      failures.push(`external _blank link missing noopener in ${rel}`);
    }
  }
}

const envExample = read(".env.example");
expect("service-role example is not populated", !/SUPABASE_(?:SERVICE_ROLE_KEY|SECRET_KEY)[ \t]*=[ \t]*[^\s#]+/.test(envExample));

console.log(`Hardening checks: ${passes.length} PASS, ${failures.length} FAIL`);
for (const pass of passes) console.log(`  ✓ ${pass}`);
for (const failure of failures) console.error(`  ✗ ${failure}`);
if (failures.length) process.exit(1);
