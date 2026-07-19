import type { ContentBlock } from "@/lib/api";

export function resolveText(block: ContentBlock | undefined | null, lang: string, fallback = ""): string {
  if (!block) return fallback;
  if (lang === "ar") return block.textAr || fallback;
  return block.text || fallback;
}

export function resolveStyle(block: ContentBlock | undefined | null, lang: string): Record<string, string> {
  if (!block) return {};
  return (lang === "ar" && block.styleAr && Object.keys(block.styleAr).length > 0)
    ? block.styleAr
    : (block.style ?? {});
}
