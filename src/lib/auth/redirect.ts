export function safeInternalPath(value: FormDataEntryValue | string | null | undefined, fallback = "/account") {
  const candidate = typeof value === "string" ? value : value?.toString();
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }
  return candidate;
}
