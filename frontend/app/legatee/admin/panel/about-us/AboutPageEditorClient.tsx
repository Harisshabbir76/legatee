"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader, getCookie, ADMIN_COOKIE } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { AboutPageData, ContentBlock, FooterData } from "@/lib/api";
import { FooterTextPanel, FooterImagePanel } from "../shared/FooterEditorPanel";
import { LanguageProvider } from "@/app/components/LanguageContext";
import { getArDefault } from "@/lib/ar-content-defaults";

import AboutHero     from "@/app/components/our-story/AboutHero";
import HeritageStory from "@/app/components/our-story/HeritageStory";
import Marquee       from "@/app/components/our-story/Marquee";
import Footer        from "@/app/components/Footer";
import Navbar        from "@/app/components/Navbar";

// -- Generic dot-path helpers --------------------------------------------------

function getBlock(content: AboutPageData, key: string): ContentBlock | null {
  const parts = key.split(".");
  let node: any = content;
  for (const p of parts) { if (node == null) return null; node = node[p]; }
  return node as ContentBlock;
}

function setBlock(content: AboutPageData, key: string, block: ContentBlock): AboutPageData {
  const parts = key.split(".");
  const clone = JSON.parse(JSON.stringify(content)) as AboutPageData;
  let node: any = clone;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = block;
  return clone;
}

function getVal(content: AboutPageData, key: string): string {
  const parts = key.split(".");
  let node: any = content;
  for (const p of parts) { if (node == null) return ""; node = node[p]; }
  return typeof node === "string" ? node : "";
}

function setVal(content: AboutPageData, key: string, val: string): AboutPageData {
  const parts = key.split(".");
  const clone = JSON.parse(JSON.stringify(content)) as AboutPageData;
  let node: any = clone;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = val;
  return clone;
}

// -- Label helpers -------------------------------------------------------------

const LABELS: Record<string, string> = {
  "hero.title":             "Hero Title",
  "story.heading":          "Section Heading",
  "story.intro":            "Intro Text",
  "story.copy":             "Body Copy",
  "story.philosophy":       "Philosophy Text",
  "story.philosophyStrong": "Philosophy Highlight",
  "story.tagline":          "Tagline",
};

const IMAGE_LABELS: Record<string, string> = {
  "hero.backgroundImage": "Hero Background",
  "hero.insetImage":      "Arch Inset Image",
  "story.storyImage":     "Heritage Photo",
  "story.treeImage1":     "Palm Tree 1 (Left)",
  "story.treeImage2":     "Palm Tree 2 (Center)",
  "story.treeImage3":     "Palm Tree 3 (Right)",
};

function getSection(key: string) {
  return key.startsWith("hero.") ? "Hero Section" : "Our Story";
}

// -- Editor CSS ----------------------------------------------------------------

const EDITOR_STYLES = `
  .legatee-editor-active [data-marquee-edit] {
    cursor: pointer !important;
    position: relative;
  }
  .legatee-editor-active [data-marquee-edit]:hover {
    outline: 1.5px dashed #93c5fd !important;
    outline-offset: 3px;
  }
  .legatee-editor-active [data-marquee-edit].legatee-marquee-selected {
    outline: 2.5px solid #3B82F6 !important;
    outline-offset: 3px;
  }
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
  .legatee-editor-active [data-editable-image] {
    cursor: pointer !important;
    position: relative;
  }
  .legatee-editor-active [data-editable-image].legatee-img-selected {
    outline: 2.5px solid #3B82F6 !important;
    outline-offset: 0px;
  }
  .legatee-editor-active a,
  .legatee-editor-active button {
    pointer-events: none;
  }
  .legatee-editor-active [data-editable],
  .legatee-editor-active [data-editable-image] {
    pointer-events: auto !important;
  }
`;

// -- Panel sub-components ------------------------------------------------------

type StyleRecord = Record<string, string>;
type StyleKey    = keyof NonNullable<ContentBlock["style"]>;

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
            <input type="text" value={style[k] ?? ""} onChange={(e) => onChange(k, e.target.value)} placeholder="px"
              style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "4px 6px", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
          </div>
        );
      })}
    </div>
  );
}

function Divider({ title }: { title: string }) {
  return <div style={{ padding: "7px 16px", background: "#faf7f1", borderTop: "1px solid #ede5d8", borderBottom: "1px solid #ede5d8", fontSize: 10, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0" }}>{title}</div>;
}

const TAG_OPTS    = ["p","h1","h2","h3","h4","h5","h6","span"].map((t) => ({ label: t.toUpperCase(), value: t }));
const FONT_OPTS   = [{ label: "Default", value: "" }, { label: "Ivy Bodoni Condensed", value: "ivybodoni-condensed" }, { label: "DM Sans", value: "dm-sans" }];
const WEIGHT_OPTS = ["","300","400","500","600","700","800"].map((w) => ({ label: w || "Default", value: w }));
const ALIGN_OPTS  = ["","left","center","right","justify"].map((a) => ({ label: a || "Default", value: a }));

function PropertiesPanel({ elKey, content, onBlock, previewLang, onClose }: {
  elKey: string; content: AboutPageData;
  onBlock: (k: string, b: ContentBlock) => void;
  previewLang: "en" | "ar";
  onClose: () => void;
}) {
  const [panelLang, setPanelLang] = useState<"en" | "ar">(previewLang);
  useEffect(() => setPanelLang(previewLang), [previewLang]);
  const block = getBlock(content, elKey);
  const style = (panelLang === "ar" ? (block?.styleAr ?? {}) : (block?.style ?? {})) as StyleRecord;
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
    ? (panelLang === "ar" ? (block.textAr ?? getArDefault("about", elKey)) : block.text)
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

  if (!block) return null;

  return (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>{getSection(elKey)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{LABELS[elKey] ?? elKey.split(".").pop()}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, paddingBottom: 24 }}>
        <Divider title="Content" />
        <div style={{ padding: "0 16px" }}>
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
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
            {([
              { l: "B", cmd: "bold" },
              { l: "I", cmd: "italic" },
              { l: "U", cmd: "underline" },
            ] as const).map(({ l, cmd }) => (
              <button key={l} onClick={() => applyFormat(cmd)}
                style={{ width: 30, height: 30, border: "1px solid #d4c5b5", borderRadius: 4, background: "#fff", color: "#3B1814", fontSize: 12, cursor: "pointer" }}>
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
          <button onClick={() => onBlock(elKey, panelLang === "ar" ? { ...block, styleAr: {} } : { ...block, style: {} })}
            style={{ marginTop: 14, width: "100%", padding: "7px 0", border: "1px solid #d4c5b5", borderRadius: 4, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
            Reset {panelLang === "ar" ? "Arabic" : "English"} styles
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Default content -----------------------------------------------------------

const DEFAULT: AboutPageData = {
  hero: {
    title: { text: "ABOUT LEGATEE", tag: "h1", style: {} },
  },
  marquee: {
    words: "Culture\nPrestige\nEssence\nExpression\nLuxury\nLegacy\nScent\nHeritage\nDepth\nElegance\nIdentity\nCraftsmanship\nCharacter\nTradition\nRefined\nDistinctive\nMemorable\nArtistry",
  },
  story: {
    heading:          { text: "A STORY OF HERITAGE & MODERNITY", tag: "h2", style: {} },
    intro:            { text: "At LEGATEE, fragrance is more than a scent � it is a reflection of identity, memory, and culture. Inspired by the beauty of Arabian heritage and reimagined through a modern lens, LEGATEE creates fragrances that honor tradition while embracing contemporary elegance. Each creation is thoughtfully crafted for those who appreciate depth, character, and the timeless art of perfumery.", tag: "p", style: {} },
    copy:             { text: "Our collection bridges the past and the present, blending classic influences with modern fragrance craftsmanship to create scents that feel both familiar and refreshingly new. From bold, expressive perfumes to lighter everyday mists, every bottle is designed to accompany moments, evoke emotion, and leave a lasting impression.", tag: "p", style: {} },
    philosophy:       { text: "At the heart of LEGATEE lies a simple philosophy:", tag: "span", style: {} },
    philosophyStrong: { text: "to create fragrances that celebrate where we come from while inspiring who we become.", tag: "span", style: {} },
    tagline:          { text: "ROOTED IN HERITAGE, SHAPED FOR TODAY.", tag: "h3", style: {} },
  },
};

// -- Main editor ---------------------------------------------------------------

const DEFAULT_FOOTER: FooterData = {
  quote:          { text: "FRAGRANCE IS MEMORY, IDENTITY, AND EMOTION - CAPTURED IN A BOTTLE.", tag: "h2", style: {} },
  signatureTitle: { text: "FIND YOUR SIGNATURE SCENT", tag: "h3", style: {} },
  signatureCopy:  { text: "Discover fragrances that combine tradition, elegance, and modern expression.", tag: "p", style: {} },
  buttonText:     { text: "EXPLORE THE COLLECTION", tag: "span", style: {} },
  buttonLink:     "/shop",
  footerImage:    "",
};

export default function AboutPageEditorClient({ initialContent, initialFooterContent }: { initialContent: AboutPageData | null; initialFooterContent: FooterData | null }) {
  const [content, setContent]           = useState<AboutPageData>(initialContent ?? DEFAULT);
  const [footerContent, setFooterContent] = useState<FooterData>(initialFooterContent ?? DEFAULT_FOOTER);
  const [previewLang, setPreviewLang]   = useState<"en" | "ar">("en");
  const [sel, setSel]                   = useState<string | null>(null);
  const [selImg, setSelImg]             = useState<string | null>(null);
  const [footerSel, setFooterSel]       = useState<string | null>(null);
  const [footerSelImg, setFooterSelImg] = useState<string | null>(null);
  const [selMarquee, setSelMarquee]     = useState(false);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [status, setStatus]             = useState<"saved" | "error" | null>(null);
  const canvasRef                       = useRef<HTMLDivElement>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "legatee-abouteditor-styles";
    style.textContent = EDITOR_STYLES;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-selected").forEach((el) => el.classList.remove("legatee-selected"));
    if (sel) {
      canvasRef.current.querySelectorAll(`[data-editable="${CSS.escape(sel)}"]`).forEach((el) => el.classList.add("legatee-selected"));
    }
  }, [sel, content]);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-img-selected").forEach((el) => el.classList.remove("legatee-img-selected"));
    if (selImg) {
      canvasRef.current.querySelectorAll(`[data-editable-image="${CSS.escape(selImg)}"]`).forEach((el) => el.classList.add("legatee-img-selected"));
    }
  }, [selImg, content]);

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    const txtTarget = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (txtTarget) {
      const key = txtTarget.dataset.editable!;
      if (key.startsWith("footer.")) {
        setFooterSel((prev) => (prev === key ? null : key));
        setFooterSelImg(null); setSel(null); setSelImg(null); setSelMarquee(false);
      } else {
        setSel((prev) => (prev === key ? null : key));
        setFooterSel(null); setFooterSelImg(null); setSelImg(null); setSelMarquee(false);
      }
      return;
    }

    const imgTarget = (e.target as HTMLElement).closest("[data-editable-image]") as HTMLElement | null;
    if (imgTarget) {
      const key = imgTarget.dataset.editableImage!;
      if (key.startsWith("footer.")) {
        setFooterSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setSel(null); setSelImg(null); setSelMarquee(false);
      } else {
        setSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setFooterSelImg(null); setSel(null); setSelMarquee(false);
      }
      return;
    }

    const marqueeTarget = (e.target as HTMLElement).closest("[data-marquee-edit]") as HTMLElement | null;
    if (marqueeTarget) {
      setSelMarquee((prev) => !prev);
      setSel(null); setSelImg(null); setFooterSel(null); setFooterSelImg(null);
      return;
    }

    setSel(null); setSelImg(null); setSelMarquee(false); setFooterSel(null); setFooterSelImg(null);
  }

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
      const endpoint = isFooterImg ? `${API_URL}/api/footer/upload-image` : `${API_URL}/api/aboutpage/upload-image`;
      const res = await adminFetch(endpoint, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      if (isFooterImg) {
        setFooterContent((prev) => ({ ...prev, footerImage: url }));
      } else {
        setContent((prev) => setVal(prev, activeImgKey, url));
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

  async function save() {
    setSaving(true); setStatus(null);
    try {
      const [pageRes, footerRes] = await Promise.all([
        adminFetch(`${API_URL}/api/aboutpage`, {
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

  const panelOpen = !!(sel || selImg || selMarquee || footerSel || footerSelImg);
  const imgUrl = selImg ? getVal(content, selImg) : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'dm-sans', ui-sans-serif, sans-serif" }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      {/* Top bar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", minHeight: 40, background: "#3B1814", flexShrink: 0, zIndex: 9999, gap: 6, flexWrap: "nowrap", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Link href="/legatee/admin/panel" style={{ color: "#c9a89a", fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>← Admin</Link>
          <span style={{ color: "#6b3329", fontSize: 11 }}>|</span>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Our Story Editor</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {(["en", "ar"] as const).map((l) => (
            <button key={l} onClick={() => setPreviewLang(l)}
              style={{ padding: "3px 10px", border: `1px solid ${previewLang === l ? "#fff" : "#6b3329"}`, borderRadius: 4, background: previewLang === l ? "#fff" : "transparent", color: previewLang === l ? "#3B1814" : "#c9a89a", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>
              {l === "en" ? "EN" : "AR"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {status === "saved" && <span style={{ color: "#86efac", fontSize: 10 }}>✓ Saved</span>}
          {status === "error" && <span style={{ color: "#fca5a5", fontSize: 10 }}>✕ Save failed</span>}
          <Link href="/our-story" target="_blank" style={{ padding: "3px 8px", border: "1px solid #6b3329", borderRadius: 4, color: "#c9a89a", fontSize: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
            View live →
          </Link>
          <button onClick={save} disabled={saving}
            style={{ padding: "4px 10px", background: saving ? "#6b3329" : "#fff", color: "#3B1814", border: "none", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Page canvas */}
        <main
          ref={canvasRef}
          className="legatee-editor-active"
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
          onClickCapture={handleCanvasClick}
        >
          <LanguageProvider defaultLang={previewLang}>
            <div style={{ pointerEvents: "none" }}><Navbar /></div>

            <AboutHero     content={content.hero} />
            <HeritageStory content={content.story} />

            <div data-marquee-edit className={selMarquee ? "legatee-marquee-selected" : ""}>
              <Marquee content={content.marquee} />
            </div>

            <Footer content={footerContent} />
          </LanguageProvider>
        </main>

        {/* Text properties panel */}
        {sel && (
          <PropertiesPanel
            elKey={sel}
            content={content}
            onBlock={onBlock}
            previewLang={previewLang}
            onClose={() => setSel(null)}
          />
        )}

        {/* Marquee words panel */}
        {selMarquee && (
          <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>Marquee</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>Scrolling Words</div>
              </div>
              <button onClick={() => setSelMarquee(false)} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Words (one per line)</div>
              <textarea
                value={content.marquee?.words ?? "Culture\nPrestige\nEssence\nExpression\nLuxury\nLegacy\nScent\nHeritage\nDepth\nElegance\nIdentity\nCraftsmanship\nCharacter\nTradition\nRefined\nDistinctive\nMemorable\nArtistry"}
                onChange={(e) => {
                  setContent((p) => ({ ...p, marquee: { words: e.target.value } }));
                  setStatus(null);
                }}
                rows={20}
                style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "6px 8px", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.8, fontFamily: "inherit" }}
              />
              <div style={{ marginTop: 10, padding: 12, background: "#faf7f1", borderRadius: 6, fontSize: 11, color: "#6f6459", lineHeight: 1.7 }}>
                Each line becomes one scrolling word. The marquee repeats them automatically. Click <strong>Save Changes</strong> to publish.
              </div>
            </div>
          </div>
        )}

        {/* Footer text panel */}
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

        {/* Footer image panel */}
        {footerSelImg && (
          <FooterImagePanel
            imageUrl={footerContent.footerImage ?? ""}
            uploading={uploading}
            onUpload={() => fileInputRef.current?.click()}
            onRevert={() => { setFooterContent((p) => ({ ...p, footerImage: "" })); setStatus(null); }}
            onClose={() => setFooterSelImg(null)}
          />
        )}

        {/* Image properties panel */}
        {selImg && (
          <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>Image</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{IMAGE_LABELS[selImg] ?? "Image"}</div>
              </div>
              <button onClick={() => setSelImg(null)} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
            </div>

            <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Current Image</div>
              <div style={{ background: "#f5f0e8", borderRadius: 6, overflow: "hidden", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {imgUrl
                  ? <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 11, color: "#aaa", textAlign: "center", padding: "0 16px" }}>Using default image<br />(upload to replace)</span>
                }
              </div>

              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ width: "100%", padding: "12px 0", background: uploading ? "#e8e0d5" : "#3B1814", color: uploading ? "#aaa" : "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}>
                {uploading ? "Uploading…" : "?  Replace image"}
              </button>

              <div style={{ marginTop: 8, fontSize: 10, color: "#aaa", textAlign: "center" }}>
                Supports JPG, PNG, WebP � Max 10 MB
              </div>

              {imgUrl && (
                <button onClick={() => { setContent((p) => setVal(p, selImg, "")); setStatus(null); }}
                  style={{ marginTop: 12, width: "100%", padding: "8px 0", border: "1px solid #d4c5b5", borderRadius: 6, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
                  ← Revert to default image
                </button>
              )}

              <div style={{ marginTop: 20, padding: 12, background: "#faf7f1", borderRadius: 6, fontSize: 11, color: "#6f6459", lineHeight: 1.7 }}>
                <strong style={{ color: "#3B1814" }}>Tip:</strong> After uploading, click <strong>Save Changes</strong> to publish to the live site.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
