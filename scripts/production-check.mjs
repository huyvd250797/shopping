import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const passes = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file, label = file) {
  const ok = fs.existsSync(path.join(root, file));
  (ok ? passes : failures).push(`${label}${ok ? "" : " (missing)"}`);
}

function contains(file, needle, label) {
  try {
    const ok = read(file).includes(needle);
    (ok ? passes : failures).push(`${label}${ok ? "" : ` (not found in ${file})`}`);
  } catch {
    failures.push(`${label} (${file} unreadable)`);
  }
}

function notContainsInTree(dir, needles, label) {
  const base = path.join(root, dir);
  const stack = [base];
  const bad = [];
  while (stack.length) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const text = fs.readFileSync(target, "utf8");
        for (const needle of needles) if (text.includes(needle)) bad.push(path.relative(root, target));
      }
    }
  }
  if (bad.length) failures.push(`${label}: ${[...new Set(bad)].join(", ")}`);
  else passes.push(label);
}

const pkg = JSON.parse(read("package.json"));
(pkg.version === "1.0.0" ? passes : failures).push(`package version = ${pkg.version}`);

contains("src/config/site.ts", 'version: "1.0.0"', "siteConfig V1.0.0");
contains("VERSION.md", "V1.0.0 — Production Ready", "VERSION.md release label");
contains("supabase/migrations/202609120010_production_ready.sql", "app_release", "migration 010 release marker");
contains("src/app/api/health/route.ts", "getProductionReadiness", "health endpoint readiness check");
contains("src/lib/observability/logger.ts", "REDACT_KEYS", "structured logger redaction");
contains("src/app/admin/(protected)/system/page.tsx", "System Readiness", "Admin System Readiness page");
contains("src/components/admin/admin-sidebar.tsx", '"/admin/system"', "Admin System navigation");
contains("PRODUCTION_RUNBOOK.md", "Backup", "production backup runbook");
contains("PRODUCTION_QA_CHECKLIST.md", "Checkout", "production QA checklist");
contains("DEPLOY.md", "migration 010", "deploy migration 010 instruction");
contains(".env.example", "SUPABASE_DB_URL", "backup database env documented");
exists("scripts/backup-db.mjs", "database backup script");
exists("scripts/verify-backup.mjs", "backup verification script");
notContainsInTree("src", ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "SUPABASE_DB_URL"], "No server secrets referenced in application src");

const requiredScripts = ["build", "lint", "typecheck", "qa:hardening", "qa:production", "backup:db", "backup:verify"];
for (const script of requiredScripts) {
  (pkg.scripts?.[script] ? passes : failures).push(`npm script: ${script}`);
}

console.log(`Production checks: ${passes.length} PASS, ${failures.length} FAIL`);
for (const pass of passes) console.log(`  ✓ ${pass}`);
for (const failure of failures) console.error(`  ✗ ${failure}`);
if (failures.length) process.exit(1);
