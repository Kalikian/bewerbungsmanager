// /lib/browser/clipboard.ts
"use client";

export async function copyToClipboard(text?: string) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false; // z.B. HTTP statt HTTPS
  }
}