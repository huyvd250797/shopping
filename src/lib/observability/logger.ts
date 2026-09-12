import { siteConfig } from "@/config/site";

type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const REDACT_KEYS = new Set([
  "password",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "phone",
  "email",
  "address",
  "address_line",
  "customer_name",
  "note",
  "internal_note",
]);

function scrub(value: unknown, key?: string): unknown {
  if (key && REDACT_KEYS.has(key.toLowerCase())) return "[REDACTED]";
  if (Array.isArray(value)) return value.map((item) => scrub(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [childKey, scrub(childValue, childKey)]),
    );
  }
  if (typeof value === "string" && value.length > 500) return `${value.slice(0, 500)}…`;
  return value;
}

function write(level: LogLevel, event: string, context: LogContext = {}) {
  const cleanContext = scrub(context) as Record<string, unknown>;
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    app: "myshop",
    version: siteConfig.version,
    ...cleanContext,
  };

  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info(event: string, context?: LogContext) {
    write("info", event, context);
  },
  warn(event: string, context?: LogContext) {
    write("warn", event, context);
  },
  error(event: string, context?: LogContext) {
    write("error", event, context);
  },
};
