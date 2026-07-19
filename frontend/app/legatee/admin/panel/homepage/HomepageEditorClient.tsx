"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader, getCookie, ADMIN_COOKIE } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { HomepageData, ContentBlock, Collection, FooterData, Product, ArrowConfig } from "@/lib/api";
import { FooterTextPanel, FooterImagePanel } from "../shared/FooterEditorPanel";
import { LanguageProvider } from "@/app/components/LanguageContext";
import { getArDefault } from "@/lib/ar-content-defaults";

// Image key ? path in HomepageData where the URL is stored
type ArrowPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "bottom";
type ImageKey =
  | "hero.backgroundImage"
  | "heritage.image"
  | "collection.monogramImage"
  | `whyChoose.arrows.${ArrowPosition}.image`
  | `whyChoose.items.${number}.image`;

// -- Real homepage section components -----------------------------------------
// These render with their actual CSS modules + images � identical to the live site
import HeroSection      from "@/app/components/home/HeroSection";
import HeritageStory    from "@/app/components/home/HeritageStory";
import OurCollection    from "@/app/components/home/OurCollection";
import LovedProducts    from "@/app/components/home/LovedProducts";
import WhyLegatee       from "@/app/components/home/WhyLegatee";
import Footer           from "@/app/components/Footer";
import Navbar           from "@/app/components/Navbar";

// -- Defaults ------------------------------------------------------------------

const DEFAULT: HomepageData = {
  hero: {
    title:      { text: "ROOTED IN HERITAGE. CRAFTED FOR TODAY.", tag: "h1", style: {} },
    eyebrow:    { text: "A modern fragrance house inspired by timeless Arabian scent traditions.", tag: "p", style: {} },
    copy:       { text: "LEGATEE creates fragrances that bridge the elegance of the past with the spirit of the present, rich, expressive scents designed for today's generation of fragrance lovers.", tag: "p", style: {} },
    buttonText: { text: "EXPLORE THE COLLECTION", tag: "span", style: {} },
    buttonLink: "/shop",
  },
  heritage: {
    heading: { text: "OUR STORY", tag: "h2", style: {} },
    intro:   { text: "Born from a lifelong passion for perfumery, LEGATEE was founded by Suhail with a simple belief: fragrance should become part of your identity.", tag: "p", style: {} },
    copy:    { text: "From the subtle scent that lingers on a kandora to the memories attached to a familiar aroma, every LEGATEE fragrance is crafted to evoke emotion, character, and connection.", tag: "p", style: {} },
    tagline: { text: "Designed with intention. Remembered with meaning.", tag: "p", style: {} },
  },
  collection: {
    title: { text: "FEATURED COLLECTION", tag: "h2", style: {} },
    copy:  { text: "Discover fragrances inspired by memory, identity, and the art of lasting impressions.", tag: "p", style: {} },
  },
  lovedProducts: {
    title:      { text: "MOST LOVED PRODUCTS", tag: "h2", style: {} },
    copy:       { text: "Discover the fragrances our customers return to time and time again�crafted to leave a lasting impression and become part of their everyday story.", tag: "p", style: {} },
    buttonText: { text: "SHOP ALL", tag: "span", style: {} },
    buttonLink: "/shop",
  },
  brandQuote: {
    heading: { text: "SOFTLY RARE. DEEPLY YOURS.", tag: "h2", style: {} },
    copy:    { text: "A fragrance made to be remembered.", tag: "p", style: {} },
  },
  whyChoose: {
    sectionTitle: { text: "WHY LEGATEE?", tag: "h2", style: {} },
    buttonText:   { text: "SHOP NOW", tag: "span", style: {} },
    buttonLink:   "/shop",
    items: [
      { title: { text: "ROOTED IN MIDDLE EASTERN FRAGRANCE CULTURE", tag: "h3", style: {} }, line1: { text: "", tag: "p", style: {} }, line2: { text: "", tag: "p", style: {} } },
      { title: { text: "INSPIRED BY LEGACY AND PERSONAL EXPRESSION", tag: "h3", style: {} }, line1: { text: "", tag: "p", style: {} }, line2: { text: "", tag: "p", style: {} } },
      { title: { text: "CRAFTED WITH CAREFULLY SELECTED FRAGRANCE OILS", tag: "h3", style: {} }, line1: { text: "", tag: "p", style: {} }, line2: { text: "", tag: "p", style: {} } },
      { title: { text: "DESIGNED FOR LASTING IMPRESSIONS", tag: "h3", style: {} }, line1: { text: "", tag: "p", style: {} }, line2: { text: "", tag: "p", style: {} } },
      { title: { text: "GUIDED BY FRENCH- INSPIRED REFINEMENT", tag: "h3", style: {} }, line1: { text: "", tag: "p", style: {} }, line2: { text: "", tag: "p", style: {} } },
    ],
  },
};

// -- State helpers -------------------------------------------------------------

function getBlock(content: HomepageData, key: string): ContentBlock | null {
  const parts = key.split(".");
  let node: any = content;
  for (const p of parts) { if (node == null) return null; node = node[p]; }
  return node as ContentBlock;
}

function setBlock(content: HomepageData, key: string, block: ContentBlock): HomepageData {
  const parts = key.split(".");
  const clone = JSON.parse(JSON.stringify(content)) as HomepageData;
  let node: any = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const nextIsIndex = /^\d+$/.test(nextPart);
    if (node[part] == null) node[part] = nextIsIndex ? [] : {};
    if (nextIsIndex && !Array.isArray(node[part])) node[part] = [];
    const idx = /^\d+$/.test(part) ? Number(part) : null;
    if (idx !== null) {
      if (node[idx] == null) node[idx] = {};
      node = node[idx];
    } else {
      node = node[part];
    }
  }
  node[parts[parts.length - 1]] = block;
  return clone;
}

function getLinkVal(content: HomepageData, key: string): string {
  const parts = key.split(".");
  let node: any = content;
  for (const p of parts) { if (node == null) return ""; node = node[p]; }
  return typeof node === "string" ? node : "";
}

function setLinkVal(content: HomepageData, key: string, val: string): HomepageData {
  const parts = key.split(".");
  const clone = JSON.parse(JSON.stringify(content)) as HomepageData;
  let node: any = clone;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = val;
  return clone;
}

type StyleRecord = Record<string, string>;
type StyleKey    = keyof NonNullable<ContentBlock["style"]>;

const LINK_KEYS = new Set(["hero.buttonLink", "whyChoose.buttonLink", "lovedProducts.buttonLink"]);

// -- Label helpers -------------------------------------------------------------

// Map from button-text key ? its corresponding link key
const BUTTON_LINK_MAP: Record<string, string> = {
  "hero.buttonText":            "hero.buttonLink",
  "lovedProducts.buttonText":   "lovedProducts.buttonLink",
  "whyChoose.buttonText":       "whyChoose.buttonLink",
};

const LABEL: Record<string, string> = {
  "hero.title": "Hero Title", "hero.eyebrow": "Eyebrow", "hero.copy": "Body Copy",
  "hero.buttonText": "Button", "hero.buttonLink": "Button URL",
  "heritage.heading": "Section Heading", "heritage.intro": "Intro Text", "heritage.copy": "Body Copy", "heritage.tagline": "Tagline",
  "collection.title": "Section Title", "collection.copy": "Description",
  "lovedProducts.title": "Section Title", "lovedProducts.copy": "Description", "lovedProducts.buttonText": "Button", "lovedProducts.buttonLink": "Button URL",
  "whyChoose.sectionTitle": "Section Title", "whyChoose.buttonText": "Button", "whyChoose.buttonLink": "Button URL",
};

function getLabel(key: string) {
  if (LABEL[key]) return LABEL[key];
  const parts = key.split(".");
  const n = parseInt(parts[2] ?? "0") + 1;
  const f = parts[3] === "title" ? "Title" : parts[3] === "line1" ? "Line 1" : "Line 2";
  return `Item ${n} � ${f}`;
}

function getSection(key: string) {
  if (key.startsWith("hero"))           return "Hero";
  if (key.startsWith("heritage"))       return "Heritage Story";
  if (key.startsWith("collection"))     return "Our Collection";
  if (key.startsWith("lovedProducts"))  return "Most Loved Products";
  return "Why LEGATEE";
}

// -- Properties panel ----------------------------------------------------------

function PF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const baseInput: React.CSSProperties = { width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "5px 8px", fontSize: 11, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

function PI({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? ""} style={baseInput} />;
}

function PS({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...baseInput, background: "#fff" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SpacingGrid({ prefix, style, onChange }: { prefix: "margin" | "padding"; style: StyleRecord; onChange: (k: StyleKey, v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {(["Top", "Right", "Bottom", "Left"] as const).map((side) => {
        const k = `${prefix}${side}` as StyleKey;
        return (
          <div key={side}>
            <div style={{ fontSize: 9, color: "#aaa", marginBottom: 2, textTransform: "uppercase" }}>{side}</div>
            <input type="text" value={style[k] ?? ""} onChange={(e) => onChange(k, e.target.value)} placeholder="px" style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "4px 6px", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
          </div>
        );
      })}
    </div>
  );
}

function Divider({ title }: { title: string }) {
  return <div style={{ padding: "7px 16px", background: "#faf7f1", borderTop: "1px solid #ede5d8", borderBottom: "1px solid #ede5d8", fontSize: 10, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0 10px" }}>{title}</div>;
}

const TAG_OPTS    = ["p","h1","h2","h3","h4","h5","h6","span"].map((t) => ({ label: t.toUpperCase(), value: t }));
const FONT_OPTS   = [{ label: "Default", value: "" }, { label: "Ivy Bodoni Condensed", value: "ivybodoni-condensed" }, { label: "DM Sans", value: "dm-sans" }];
const WEIGHT_OPTS = ["","300","400","500","600","700","800"].map((w) => ({ label: w || "Default", value: w }));
const ALIGN_OPTS  = ["","left","center","right","justify"].map((a) => ({ label: a || "Default", value: a }));

function PropertiesPanel({ elKey, content, onBlock, onLink, previewLang, onClose }: {
  elKey: string; content: HomepageData;
  onBlock: (k: string, b: ContentBlock) => void;
  onLink:  (k: string, v: string) => void;
  previewLang: "en" | "ar";
  onClose: () => void;
}) {
  const [panelLang, setPanelLang] = useState<"en" | "ar">(previewLang);
  useEffect(() => setPanelLang(previewLang), [previewLang]);
  const isLink      = LINK_KEYS.has(elKey);
  const linkedKey   = BUTTON_LINK_MAP[elKey] ?? null;
  const block       = isLink ? null : (getBlock(content, elKey) ?? { text: "", tag: "p", style: {} } as ContentBlock);
  const style       = (panelLang === "ar" ? (block?.styleAr ?? {}) : (block?.style ?? {})) as StyleRecord;
  const editorRef = useRef<HTMLDivElement>(null);

  function us(k: StyleKey, v: string) {
    if (!block) return;
    if (panelLang === "ar") {
      onBlock(elKey, { ...block, styleAr: { ...(block.styleAr ?? {}), [k]: v || undefined } as Record<string, string> });
    } else {
      onBlock(elKey, { ...block, style: { ...(block.style ?? {}), [k]: v || undefined } as Record<string, string> });
    }
  }

  const currentEditorVal = block
    ? (panelLang === "ar" ? (block.textAr ?? getArDefault("homepage", elKey)) : block.text)
    : "";

  useEffect(() => {
    const div = editorRef.current;
    if (!div || document.activeElement === div) return;
    if (div.innerHTML !== currentEditorVal) div.innerHTML = currentEditorVal;
  }, [currentEditorVal]);

  function handleEditorInput() {
    const div = editorRef.current;
    if (!div || !block) return;
    if (panelLang === "ar") onBlock(elKey, { ...block, textAr: div.innerHTML });
    else onBlock(elKey, { ...block, text: div.innerHTML });
  }

  function applyFormat(cmd: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    handleEditorInput();
  }

  return (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>{getSection(elKey)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{getLabel(elKey)}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, paddingBottom: 24 }}>
        {isLink ? (
          <div style={{ padding: 16 }}>
            <PF label="URL"><PI value={getLinkVal(content, elKey)} onChange={(v) => onLink(elKey, v)} placeholder="/shop or https://..." /></PF>
          </div>
        ) : block ? (
          <>
            <Divider title="Content" />
            <div style={{ padding: "0 16px" }}>
              {linkedKey && (
                <PF label="Redirect URL">
                  <PI value={getLinkVal(content, linkedKey)} onChange={(v) => onLink(linkedKey, v)} placeholder="/shop or https://..." />
                </PF>
              )}
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {(["en", "ar"] as const).map((l) => (
                  <button key={l} onClick={() => setPanelLang(l)}
                    style={{ flex: 1, padding: "5px 0", border: `1px solid ${panelLang === l ? "#3B1814" : "#d4c5b5"}`, borderRadius: 4, background: panelLang === l ? "#3B1814" : "#fff", color: panelLang === l ? "#fff" : "#6f6459", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>
                    {l === "en" ? "EN" : "AR"}
                  </button>
                ))}
              </div>
              <PF label={panelLang === "ar" ? "Arabic Text" : "Text"}>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  dir={panelLang === "ar" ? "rtl" : "ltr"}
                  style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "6px 8px", fontSize: 12, outline: "none", minHeight: 80, maxHeight: 160, overflowY: "auto", lineHeight: 1.5, fontFamily: "inherit", whiteSpace: "pre-wrap", wordBreak: "break-word", boxSizing: "border-box" }}
                />
              </PF>
              {/* Format quick buttons */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                {([
                  { l: "B", cmd: "bold",      extra: { fontWeight: 700 } },
                  { l: "I", cmd: "italic",    extra: { fontStyle: "italic" as const } },
                  { l: "U", cmd: "underline", extra: { textDecoration: "underline" as const } },
                ] as const).map(({ l, cmd, extra }) => (
                  <button key={l} onClick={() => applyFormat(cmd)}
                    style={{ width: 30, height: 30, border: "1px solid #d4c5b5", borderRadius: 4, background: "#fff", color: "#3B1814", fontSize: 12, cursor: "pointer", ...extra }}>
                    {l}
                  </button>
                ))}
                {[{ l: "L", v: "left" }, { l: "C", v: "center" }, { l: "R", v: "right" }].map(({ l, v }) => {
                  const a = style.textAlign === v;
                  return (
                    <button key={v} onClick={() => us("textAlign", a ? "" : v)}
                      style={{ width: 30, height: 30, border: `1px solid ${a ? "#3B1814" : "#d4c5b5"}`, borderRadius: 4, background: a ? "#3B1814" : "#fff", color: a ? "#fff" : "#3B1814", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                      {l}
                    </button>
                  );
                })}
              </div>
              <PF label="HTML Tag"><PS value={block.tag ?? "p"} onChange={(v) => onBlock(elKey, { ...block, tag: v })} options={TAG_OPTS} /></PF>
            </div>

            <Divider title="Typography" />
            <div style={{ padding: "0 16px" }}>
              <PF label="Font Family"><PS value={style.fontFamily ?? ""} onChange={(v) => us("fontFamily", v)} options={FONT_OPTS} /></PF>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PF label="Font Size"><PI value={style.fontSize ?? ""} onChange={(v) => us("fontSize", v)} placeholder="40px" /></PF>
                <PF label="Weight"><PS value={style.fontWeight ?? ""} onChange={(v) => us("fontWeight", v)} options={WEIGHT_OPTS} /></PF>
              </div>
              <PF label="Color">
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="color" value={style.color || "#3B1814"} onChange={(e) => us("color", e.target.value)} style={{ width: 32, height: 28, border: "1px solid #d4c5b5", borderRadius: 4, padding: 2, cursor: "pointer", flexShrink: 0 }} />
                  <PI value={style.color ?? ""} onChange={(v) => us("color", v)} placeholder="#3B1814" />
                </div>
              </PF>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PF label="Letter Spacing"><PI value={style.letterSpacing ?? ""} onChange={(v) => us("letterSpacing", v)} placeholder="2px" /></PF>
                <PF label="Text Align"><PS value={style.textAlign ?? ""} onChange={(v) => us("textAlign", v)} options={ALIGN_OPTS} /></PF>
              </div>
            </div>

            <Divider title="Margin" />
            <div style={{ padding: "0 16px" }}><SpacingGrid prefix="margin" style={style} onChange={us} /></div>

            <Divider title="Padding" />
            <div style={{ padding: "0 16px" }}><SpacingGrid prefix="padding" style={style} onChange={us} /></div>

            <Divider title="Layout" />
            <div style={{ padding: "0 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <PF label="Line Height"><PI value={style.lineHeight ?? ""} onChange={(v) => us("lineHeight", v)} placeholder="1.5" /></PF>
                <PF label="Width"><PI value={style.width ?? ""} onChange={(v) => us("width", v)} placeholder="100%" /></PF>
                <PF label="Min Height"><PI value={style.minHeight ?? ""} onChange={(v) => us("minHeight", v)} placeholder="120px" /></PF>
                <PF label="Max Width"><PI value={style.maxWidth ?? ""} onChange={(v) => us("maxWidth", v)} placeholder="800px" /></PF>
              </div>
              <button onClick={() => onBlock(elKey, panelLang === "ar" ? { ...block!, styleAr: {} } : { ...block!, style: {} })}
                style={{ marginTop: 14, width: "100%", padding: "7px 0", border: "1px solid #d4c5b5", borderRadius: 4, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
                Reset {panelLang === "ar" ? "Arabic" : "English"} styles
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// -- Editable highlight overlay (injected via CSS-in-JS into <head>) ------------

const EDITOR_STYLES = `
  /* Text elements � dashed hover, solid blue when selected */
  .legatee-editor-active [data-editable] {
    cursor: pointer !important;
    position: relative;
  }
  .legatee-editor-active [data-editable]:hover {
    outline: 1.5px dashed #93c5fd !important;
    outline-offset: 3px;
  }
  .legatee-editor-active [data-editable].legatee-selected {
    outline: 2.5px solid #3B82F6 !important;
    outline-offset: 3px;
  }

  /* Image containers � NO hover effect, only solid blue border when selected */
  .legatee-editor-active [data-editable-image] {
    cursor: pointer !important;
    position: relative;
  }
  .legatee-editor-active [data-editable-image].legatee-img-selected {
    outline: 2.5px solid #3B82F6 !important;
    outline-offset: 0px;
  }

  /* Disable navigation clicks on links/buttons; keep editable elements alive */
  .legatee-editor-active a,
  .legatee-editor-active button {
    pointer-events: none;
  }
  .legatee-editor-active [data-editable],
  .legatee-editor-active [data-editable-image] {
    pointer-events: auto !important;
  }
`;

// -- Image URL helpers --------------------------------------------------------

function getImageUrl(content: HomepageData, key: string): string {
  const parts = key.split(".");
  let node: any = content;
  for (const p of parts) { if (node == null) return ""; node = node[p]; }
  return typeof node === "string" ? node : "";
}

function setImageUrl(content: HomepageData, key: string, url: string): HomepageData {
  const parts = key.split(".");
  const clone = JSON.parse(JSON.stringify(content)) as HomepageData;
  let node: any = clone;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = url;
  return clone;
}

const IMAGE_LABELS: Record<string, string> = {
  "hero.backgroundImage":                    "Hero Background",
  "heritage.image":                          "Heritage Photo",
  "collection.monogramImage":                "Collection Monogram",
  "whyChoose.arrows.topLeft.image":          "Arrow � Top Left",
  "whyChoose.arrows.topRight.image":         "Arrow � Top Right",
  "whyChoose.arrows.bottomLeft.image":       "Arrow � Bottom Left",
  "whyChoose.arrows.bottomRight.image":      "Arrow � Bottom Right",
  "whyChoose.arrows.bottom.image":           "Arrow � Bottom",
};
function getImageLabel(key: string) {
  if (IMAGE_LABELS[key]) return IMAGE_LABELS[key];
  const match = key.match(/whyChoose\.items\.(\d+)\.image/);
  if (match) return `Why Choose � Item ${parseInt(match[1]) + 1} Image`;
  return "Image";
}

const ARROW_POSITION_LABELS: Record<string, string> = {
  topLeft: "Top Left", topRight: "Top Right",
  bottomLeft: "Bottom Left", bottomRight: "Bottom Right", bottom: "Bottom",
};

function getArrowPosition(key: string): ArrowPosition | null {
  const m = key.match(/whyChoose\.arrows\.(\w+)\.image/);
  return m ? (m[1] as ArrowPosition) : null;
}

function getArrowConfig(content: HomepageData, pos: ArrowPosition): ArrowConfig {
  return content.whyChoose?.arrows?.[pos] ?? {};
}

function setArrowConfig(content: HomepageData, pos: ArrowPosition, field: keyof ArrowConfig, value: string | number | undefined): HomepageData {
  const clone = JSON.parse(JSON.stringify(content)) as HomepageData;
  if (!clone.whyChoose.arrows) clone.whyChoose.arrows = {};
  if (!clone.whyChoose.arrows[pos]) clone.whyChoose.arrows[pos] = {};
  (clone.whyChoose.arrows[pos] as any)[field] = value;
  return clone;
}

// -- Main editor ----------------------------------------------------------------

const DEFAULT_FOOTER: FooterData = {
  quote:          { text: "FRAGRANCE IS MEMORY, IDENTITY, AND EMOTION - CAPTURED IN A BOTTLE.", tag: "h2", style: {} },
  signatureTitle: { text: "FIND YOUR SIGNATURE SCENT", tag: "h3", style: {} },
  signatureCopy:  { text: "Discover fragrances that combine tradition, elegance, and modern expression.", tag: "p", style: {} },
  buttonText:     { text: "EXPLORE THE COLLECTION", tag: "span", style: {} },
  buttonLink:     "/shop",
  footerImage:    "",
};

export default function HomepageEditorClient({ initialContent, initialFooterContent }: { initialContent: HomepageData | null; initialFooterContent: FooterData | null }) {
  const [content, setContent]           = useState<HomepageData>(initialContent ?? DEFAULT);
  const [footerContent, setFooterContent] = useState<FooterData>(initialFooterContent ?? DEFAULT_FOOTER);
  const [previewLang, setPreviewLang]   = useState<"en" | "ar">("en");
  const [sel, setSel]                   = useState<string | null>(null);
  const [selImg, setSelImg]             = useState<string | null>(null);
  const [footerSel, setFooterSel]       = useState<string | null>(null);
  const [footerSelImg, setFooterSelImg] = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [status, setStatus]             = useState<"saved" | "error" | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [homepageProducts, setHomepageProducts] = useState<Product[]>([]);
  const canvasRef                       = useRef<HTMLDivElement>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  // Inject editor CSS once on mount
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "legatee-editor-styles";
    style.textContent = EDITOR_STYLES;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Fetch collections and homepage products for preview
  useEffect(() => {
    fetch(`${API_URL}/api/collections`)
      .then((r) => r.ok ? r.json() : { collections: [] })
      .then((d) => setCollections(d.collections ?? []))
      .catch(() => {});
    fetch(`${API_URL}/api/products/homepage`)
      .then((r) => r.ok ? r.json() : { products: [] })
      .then((d) => setHomepageProducts(d.products ?? []))
      .catch(() => {});
  }, []);

  // Sync selected-text highlight
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-selected").forEach((el) => el.classList.remove("legatee-selected"));
    if (sel) {
      canvasRef.current.querySelectorAll(`[data-editable="${CSS.escape(sel)}"]`).forEach((el) => el.classList.add("legatee-selected"));
    }
  }, [sel, content]);

  // Sync selected-image highlight
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-img-selected").forEach((el) => el.classList.remove("legatee-img-selected"));
    if (selImg) {
      canvasRef.current.querySelectorAll(`[data-editable-image="${CSS.escape(selImg)}"]`).forEach((el) => el.classList.add("legatee-img-selected"));
    }
  }, [selImg, content]);

  // Capture-phase handler � fires before Next.js Link can navigate
  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    const txtTarget = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (txtTarget) {
      const key = txtTarget.dataset.editable!;
      if (key.startsWith("footer.")) {
        setFooterSel((prev) => (prev === key ? null : key));
        setFooterSelImg(null); setSel(null); setSelImg(null);
      } else {
        setSel((prev) => (prev === key ? null : key));
        setFooterSel(null); setFooterSelImg(null); setSelImg(null);
      }
      return;
    }

    const imgTarget = (e.target as HTMLElement).closest("[data-editable-image]") as HTMLElement | null;
    if (imgTarget) {
      const key = imgTarget.dataset.editableImage!;
      if (key.startsWith("footer.")) {
        setFooterSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setSel(null); setSelImg(null);
      } else {
        setSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setFooterSelImg(null); setSel(null);
      }
      return;
    }

    setSel(null); setSelImg(null); setFooterSel(null); setFooterSelImg(null);
  }

  // Upload a new image file
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const activeImgKey = selImg ?? footerSelImg;
    if (!file || !activeImgKey) return;
    e.target.value = "";

    setUploading(true);
    try {
      const token = getCookie(ADMIN_COOKIE);
      const fd = new FormData();
      fd.append("image", file);
      const isFooterImg = activeImgKey.startsWith("footer.");
      const endpoint = isFooterImg ? `${API_URL}/api/footer/upload-image` : `${API_URL}/api/homepage/upload-image`;
      const res = await adminFetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      if (isFooterImg) {
        setFooterContent((prev) => ({ ...prev, footerImage: url }));
      } else {
        setContent((prev) => setImageUrl(prev, activeImgKey, url));
      }
      setStatus(null);
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const onBlock = useCallback((key: string, block: ContentBlock) => {
    setContent((p) => setBlock(p, key, block));
    setStatus(null);
  }, []);

  const onLink = useCallback((key: string, val: string) => {
    setContent((p) => setLinkVal(p, key, val));
    setStatus(null);
  }, []);

  async function save() {
    setSaving(true); setStatus(null);
    try {
      const [pageRes, footerRes] = await Promise.all([
        adminFetch(`${API_URL}/api/homepage`, {
          method: "PUT", headers: { "Content-Type": "application/json", ...adminAuthHeader() }, body: JSON.stringify({ content }),
        }),
        adminFetch(`${API_URL}/api/footer`, {
          method: "PUT", headers: { "Content-Type": "application/json", ...adminAuthHeader() }, body: JSON.stringify({ content: footerContent }),
        }),
      ]);
      setStatus(pageRes.ok && footerRes.ok ? "saved" : "error");
    } catch { setStatus("error"); }
    finally { setSaving(false); }
  }

  const panelOpen = !!(sel || selImg || footerSel || footerSelImg);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'dm-sans', ui-sans-serif, sans-serif" }}>

      {/* Hidden file input for image uploads */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      {/* Top bar */}
<header style={{ 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between", 
  padding: "0 16px", 
  minHeight: "40px",
  height: "auto",
  background: "#3B1814", 
  flexShrink: 0, 
  zIndex: 9999,
  gap: "6px",
  flexWrap: "nowrap",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
}}>
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "6px", 
    flexShrink: 0,
    minWidth: "fit-content",
  }}>
    <Link 
      href="/legatee/admin/panel" 
      style={{ 
        color: "#c9a89a", 
        fontSize: "11px", 
        textDecoration: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      ← Admin
    </Link>
    <span style={{ color: "#6b3329", flexShrink: 0, fontSize: "11px" }}>|</span>
    <span style={{ 
      color: "#fff", 
      fontSize: "12px", 
      fontWeight: 600,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      Homepage Editor
    </span>
  </div>

  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
    {(["en", "ar"] as const).map((l) => (
      <button key={l} onClick={() => setPreviewLang(l)}
        style={{ padding: "3px 10px", border: `1px solid ${previewLang === l ? "#fff" : "#6b3329"}`, borderRadius: 4, background: previewLang === l ? "#fff" : "transparent", color: previewLang === l ? "#3B1814" : "#c9a89a", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>
        {l === "en" ? "EN" : "AR"}
      </button>
    ))}
  </div>

  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    flexWrap: "nowrap",
  }}>
    {status === "saved" && (
      <span style={{ color: "#86efac", fontSize: "10px", whiteSpace: "nowrap" }}>✓ Saved</span>
    )}
    {status === "error" && (
      <span style={{ color: "#fca5a5", fontSize: "10px", whiteSpace: "nowrap" }}>? Failed</span>
    )}
    
    <Link
      href="/"
      target="_blank"
      style={{ 
        padding: "3px 8px", 
        border: "1px solid #6b3329", 
        borderRadius: "4px", 
        color: "#c9a89a", 
        fontSize: "10px", 
        textDecoration: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      View live →
    </Link>
    
    <button 
      onClick={save} 
      disabled={saving}
      style={{ 
        padding: "4px 10px", 
        background: saving ? "#6b3329" : "#fff", 
        color: "#3B1814", 
        border: "none", 
        borderRadius: "4px", 
        fontSize: "10px", 
        fontWeight: 700, 
        cursor: saving ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
        minHeight: "26px",
      }}
    >
      {saving ? "Saving…" : "Save Changes"}
    </button>
  </div>
</header>

      {/* -- Body row ----------------------------------------------------------- */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* -- Scrollable page canvas � REAL section components -------------- */}
        <main
          ref={canvasRef}
          className="legatee-editor-active"
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
          onClickCapture={handleCanvasClick}
        >
          <LanguageProvider defaultLang={previewLang}>
            <div style={{ pointerEvents: "none" }}><Navbar /></div>

            <HeroSection     content={content.hero} />
            <HeritageStory   content={content.heritage} />
            <OurCollection   content={content.collection} collections={collections} />
            <LovedProducts   content={content.lovedProducts} products={homepageProducts} />
            <WhyLegatee content={content.whyChoose} />

            <Footer content={footerContent} />
          </LanguageProvider>
        </main>

        {/* -- Text properties panel ------------------------------------------ */}
        {sel && (
          <PropertiesPanel
            elKey={sel}
            content={content}
            onBlock={onBlock}
            onLink={onLink}
            previewLang={previewLang}
            onClose={() => setSel(null)}
          />
        )}

        {/* -- Footer text panel ---------------------------------------------- */}
        {footerSel && (
          <FooterTextPanel
            elKey={footerSel}
            footerContent={footerContent}
            onBlock={(k, b) => { setFooterContent((p) => ({ ...p, [k]: b })); setStatus(null); }}
            onLink={(k, v) => { setFooterContent((p) => ({ ...p, [k]: v })); setStatus(null); }}
            previewLang={previewLang}
            onClose={() => setFooterSel(null)}
          />
        )}

        {/* -- Footer image panel --------------------------------------------- */}
        {footerSelImg && (
          <FooterImagePanel
            imageUrl={footerContent.footerImage ?? ""}
            uploading={uploading}
            onUpload={() => fileInputRef.current?.click()}
            onRevert={() => { setFooterContent((p) => ({ ...p, footerImage: "" })); setStatus(null); }}
            onClose={() => setFooterSelImg(null)}
          />
        )}

        {/* -- Image properties panel ----------------------------------------- */}
        {selImg && (() => {
          const arrowPos = getArrowPosition(selImg);
          const arrowCfg = arrowPos ? getArrowConfig(content, arrowPos) : null;
          const numInput = (label: string, field: keyof ArrowConfig, unit = "px") => (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "#6f6459", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number"
                  value={(arrowCfg as any)?.[field] ?? ""}
                  placeholder="auto"
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    setContent((p) => setArrowConfig(p, arrowPos!, field, v));
                    setStatus(null);
                  }}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #d4c5b5", borderRadius: 4, fontSize: 12 }}
                />
                <span style={{ fontSize: 10, color: "#aaa", flexShrink: 0 }}>{unit}</span>
              </div>
            </div>
          );

          return (
            <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>{arrowPos ? "Arrow" : "Image"}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{getImageLabel(selImg)}</div>
                </div>
                <button onClick={() => setSelImg(null)} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
              </div>

              <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
                {/* Current image preview */}
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Current Image</div>
                <div style={{ background: "#f5f0e8", borderRadius: 6, overflow: "hidden", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  {getImageUrl(content, selImg) ? (
                    <img src={getImageUrl(content, selImg)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: 11, color: "#aaa", textAlign: "center", padding: "0 16px" }}>Using default SVG arrow<br />(upload to replace)</span>
                  )}
                </div>

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    width: "100%", padding: "12px 0", background: uploading ? "#e8e0d5" : "#3B1814",
                    color: uploading ? "#aaa" : "#fff", border: "none", borderRadius: 6,
                    fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {uploading ? "Uploading…" : "?  Replace image"}
                </button>
                <div style={{ marginTop: 8, fontSize: 10, color: "#aaa", textAlign: "center" }}>
                  Supports JPG, PNG, WebP � Max 10 MB
                </div>
                {getImageUrl(content, selImg) && (
                  <button
                    onClick={() => { setContent((p) => setImageUrl(p, selImg, "")); setStatus(null); }}
                    style={{ marginTop: 10, width: "100%", padding: "8px 0", border: "1px solid #d4c5b5", borderRadius: 6, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}
                  >
                    ← Revert to default
                  </button>
                )}

                {/* Arrow-specific size / spacing controls */}
                {arrowPos && (
                  <>
                    <div style={{ margin: "20px 0 12px", borderTop: "1px solid #e8e0d8", paddingTop: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#3B1814", marginBottom: 12 }}>
                        {ARROW_POSITION_LABELS[arrowPos]} — Size &amp; Spacing
                      </div>
                      {numInput("Arrow width", "width")}
                      {numInput("Label max-width", "labelMaxWidth")}
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 8px" }}>Margin</div>
                      {numInput("Top", "marginTop")}
                      {numInput("Right", "marginRight")}
                      {numInput("Bottom", "marginBottom")}
                      {numInput("Left", "marginLeft")}
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 8px" }}>Padding</div>
                      {numInput("Top", "paddingTop")}
                      {numInput("Right", "paddingRight")}
                      {numInput("Bottom", "paddingBottom")}
                      {numInput("Left", "paddingLeft")}
                    </div>
                  </>
                )}

                <div style={{ marginTop: 16, padding: 12, background: "#faf7f1", borderRadius: 6, fontSize: 11, color: "#6f6459", lineHeight: 1.7 }}>
                  <strong style={{ color: "#3B1814" }}>Tip:</strong> Click <strong>Save Changes</strong> to publish.
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
