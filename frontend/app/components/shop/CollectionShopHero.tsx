"use client";

import ShopHero from "./ShopHero";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";
import { resolveText, resolveStyle } from "@/lib/resolve-text";
import type { ShopHeroData } from "@/lib/api";

type CollectionId = "signature" | "kandora" | "spray";

const KEY_MAP: Record<CollectionId, { title: keyof ReturnType<typeof getT>["shop"]; copy: keyof ReturnType<typeof getT>["shop"] }> = {
  signature: { title: "signaturePerfumeTitle", copy: "signaturePerfumeCopy" },
  kandora:   { title: "kandoraPerfumeTitle",   copy: "kandoraPerfumeCopy"   },
  spray:     { title: "allOverSprayTitle",     copy: "allOverSprayCopy"     },
};

export default function CollectionShopHero({
  collectionId,
  content,
  keyPrefix,
}: {
  collectionId: CollectionId;
  content?: ShopHeroData | null;
  keyPrefix?: string;
}) {
  const { lang } = useLanguage();
  const t = getT(lang);
  const keys = KEY_MAP[collectionId];

  const title = content?.title
    ? resolveText(content.title, lang) || (t.shop[keys.title] as string)
    : (t.shop[keys.title] as string);

  const copy = content?.copy
    ? resolveText(content.copy, lang) || (t.shop[keys.copy] as string)
    : (t.shop[keys.copy] as string);

  const titleStyle = content?.title ? resolveStyle(content.title, lang) as React.CSSProperties : {};
  const copyStyle  = content?.copy  ? resolveStyle(content.copy,  lang) as React.CSSProperties : {};

  return (
    <ShopHero
      title={title}
      copy={copy}
      titleStyle={titleStyle}
      copyStyle={copyStyle}
      backgroundImage={content?.backgroundImage}
      dataEditableTitle={keyPrefix ? `${keyPrefix}.hero.title` : undefined}
      dataEditableCopy={keyPrefix ? `${keyPrefix}.hero.copy` : undefined}
    />
  );
}
