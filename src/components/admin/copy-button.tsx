"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Sao chép" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="admin-copy-button" type="button" onClick={copy} title={`Sao chép ${label.toLowerCase()}`}>
      {copied ? "Đã chép" : label}
    </button>
  );
}
