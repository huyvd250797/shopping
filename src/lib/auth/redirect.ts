const INTERNAL_ORIGIN = "https://myshop.internal";

export function safeInternalPath(value: FormDataEntryValue | string | null | undefined, fallback = "/account") {
  const candidate = typeof value === "string" ? value : value?.toString();
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(candidate, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
