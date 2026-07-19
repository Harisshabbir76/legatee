"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader, getCookie, ADMIN_COOKIE } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { LegalPageData, LegalTab, LegalSection, ContentBlock, FooterData } from "@/lib/api";
import { FooterTextPanel, FooterImagePanel } from "../shared/FooterEditorPanel";
import { LanguageProvider } from "@/app/components/LanguageContext";
import { getArDefault } from "@/lib/ar-content-defaults";
import { getT } from "@/lib/translations";
import Legal from "@/app/components/legal/Legal";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// -- Editor styles -------------------------------------------------------------

const EDITOR_STYLES = `
  .legatee-legal-editor [data-editable] {
    cursor: pointer !important;
    outline: 1.5px dashed transparent;
    transition: outline-color 0.15s;
  }
  .legatee-legal-editor [data-editable]:hover {
    outline-color: #93c5fd !important;
    outline-offset: 2px;
  }
  .legatee-legal-editor [data-editable].legatee-sel {
    outline: 2.5px solid #3B82F6 !important;
    outline-offset: 2px;
  }
  .legatee-legal-editor [data-editable-image] {
    cursor: pointer !important;
  }
  .legatee-legal-editor [data-editable-image]:hover {
    outline: 1.5px dashed #93c5fd !important;
    outline-offset: 3px;
  }
  .legatee-legal-editor [data-editable-image].legatee-img-sel {
    outline: 2.5px solid #3B82F6 !important;
  }
  .legatee-legal-editor a,
  .legatee-legal-editor button:not([data-legal-tab]) {
    pointer-events: none;
  }
  .legatee-legal-editor [data-legal-tab],
  .legatee-legal-editor [data-editable],
  .legatee-legal-editor [data-editable-image] {
    pointer-events: auto !important;
  }
`;

// -- Helpers -------------------------------------------------------------------

const mkBlock = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

function getBlock(content: LegalPageData, key: string): ContentBlock | null {
  const parts = key.split(".");
  let node: any = content;
  for (const p of parts) {
    if (node == null) return null;
    node = node[p];
  }
  return node as ContentBlock;
}

function setBlock(content: LegalPageData, key: string, block: ContentBlock): LegalPageData {
  const parts = key.split(".");
  const clone = JSON.parse(JSON.stringify(content)) as LegalPageData;
  let node: any = clone;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = block;
  return clone;
}

// -- Defaults ------------------------------------------------------------------

function buildTabsFromTranslations(): LegalTab[] {
  const t = getT("en").legal;
  return t.tabs.map((label, i) => {
    const tabContent = t.tabsContent[i];
    return {
      label: mkBlock(label, "span"),
      intro: mkBlock(""),
      sections: (tabContent?.sections ?? []).map((sec) => ({
        title: mkBlock(sec.title, "h2"),
        lines: sec.lines.map((l) => mkBlock(l)),
      })),
    };
  });
}

const DEFAULT: LegalPageData = {
  heroTitle:    mkBlock("LEGAL", "h1"),
  heroSubtitle: mkBlock("At LEGATEE, transparency and trust are fundamental to every experience we create. This section outlines the policies, terms, and information that govern the use of our website, products, and services, helping ensure a secure and seamless journey for every customer."),
  heroImage: "",
  tabs: buildTabsFromTranslations(),
};

// -- PropertiesPanel sub-components --------------------------------------------

const baseInp: React.CSSProperties = { width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "5px 8px", fontSize: 11, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

function PF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
function PI({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? ""} style={baseInp} />;
}
function PS({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...baseInp, background: "#fff" }}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}
function Divider({ title }: { title: string }) {
  return <div style={{ padding: "7px 16px", background: "#faf7f1", borderTop: "1px solid #ede5d8", borderBottom: "1px solid #ede5d8", fontSize: 10, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0" }}>{title}</div>;
}
function SpacingGrid({ prefix, style, onChange }: { prefix: "margin" | "padding"; style: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {(["Top", "Right", "Bottom", "Left"] as const).map((side) => {
        const k = `${prefix}${side}`;
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

const TAG_OPTS    = ["p","h1","h2","h3","h4","h5","h6","span"].map((t) => ({ label: t.toUpperCase(), value: t }));
const FONT_OPTS   = [{ label: "Default", value: "" }, { label: "Ivy Bodoni Condensed", value: "ivybodoni-condensed" }, { label: "DM Sans", value: "dm-sans" }];
const WEIGHT_OPTS = ["","300","400","500","600","700","800"].map((w) => ({ label: w || "Default", value: w }));
const ALIGN_OPTS  = ["","left","center","right","justify"].map((a) => ({ label: a || "Default", value: a }));

function getLabel(key: string) {
  if (key === "heroTitle")    return "Page Heading";
  if (key === "heroSubtitle") return "Page Subtitle";
  if (/^tabs\.\d+\.label$/.test(key)) return `Tab ${parseInt(key.split(".")[1]) + 1} Label`;
  if (/^tabs\.\d+\.intro$/.test(key)) return `Tab ${parseInt(key.split(".")[1]) + 1} Intro`;
  if (/^tabs\.\d+\.sections\.\d+\.title$/.test(key)) { const [,t,,s] = key.split("."); return `Tab ${+t+1} � Section ${+s+1} Title`; }
  if (/^tabs\.\d+\.sections\.\d+\.lines\.\d+$/.test(key)) { const [,t,,s,,l] = key.split("."); return `Tab ${+t+1} � �${+s+1} � Line ${+l+1}`; }
  return key;
}
function getSection(key: string) {
  if (key === "heroTitle" || key === "heroSubtitle") return "Hero";
  if (/^tabs\.\d+\.label/.test(key)) return "Tab Label";
  if (/^tabs\.\d+\.intro/.test(key)) return "Tab Intro";
  if (/^tabs\.\d+\.sections/.test(key)) return "Section Content";
  return "";
}

interface PPProps {
  elKey: string;
  content: LegalPageData;
  onBlock: (k: string, b: ContentBlock) => void;
  extraContent?: React.ReactNode;
  onClose: () => void;
}

function PropertiesPanel({ elKey, content, onBlock, extraContent, previewLang, onClose }: PPProps & { previewLang: "en" | "ar" }) {
  const [panelLang, setPanelLang] = useState<"en" | "ar">(previewLang);
  useEffect(() => setPanelLang(previewLang), [previewLang]);
  const block = getBlock(content, elKey);
  const style = (panelLang === "ar" ? (block?.styleAr ?? {}) : (block?.style ?? {})) as Record<string, string>;
  const editorRef = useRef<HTMLDivElement>(null);

  function us(k: string, v: string) {
    if (!block) return;
    if (panelLang === "ar") {
      const newStyleAr = { ...(block.styleAr ?? {}) } as Record<string, string>;
      if (v) newStyleAr[k] = v; else delete newStyleAr[k];
      onBlock(elKey, { ...block, styleAr: newStyleAr });
    } else {
      const newStyle = { ...(block.style ?? {}) } as Record<string, string>;
      if (v) newStyle[k] = v; else delete newStyle[k];
      onBlock(elKey, { ...block, style: newStyle });
    }
  }

  const currentEditorVal = block
    ? (panelLang === "ar" ? (block.textAr ?? getArDefault("legal", elKey)) : block.text)
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
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{getLabel(elKey)}</div>
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
            <PF label="Font Size"><PI value={style.fontSize ?? ""} onChange={(v) => us("fontSize", v)} placeholder="16px" /></PF>
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

        <Divider title="Spacing" />
        <div style={{ padding: "0 16px" }}>
          <div style={{ fontSize: 11, color: "#6f6459", marginBottom: 8 }}>Margin</div>
          <SpacingGrid prefix="margin" style={style} onChange={us} />
          <div style={{ fontSize: 11, color: "#6f6459", margin: "12px 0 8px" }}>Padding</div>
          <SpacingGrid prefix="padding" style={style} onChange={us} />
        </div>

        <Divider title="Layout" />
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <PF label="Line Height"><PI value={style.lineHeight ?? ""} onChange={(v) => us("lineHeight", v)} placeholder="1.5" /></PF>
            <PF label="Width"><PI value={style.width ?? ""} onChange={(v) => us("width", v)} placeholder="100%" /></PF>
            <PF label="Min Height"><PI value={style.minHeight ?? ""} onChange={(v) => us("minHeight", v)} placeholder="auto" /></PF>
            <PF label="Max Width"><PI value={style.maxWidth ?? ""} onChange={(v) => us("maxWidth", v)} placeholder="800px" /></PF>
          </div>
          <button onClick={() => onBlock(elKey, panelLang === "ar" ? { ...block, styleAr: {} } : { ...block, style: {} })}
            style={{ marginTop: 14, width: "100%", padding: "7px 0", border: "1px solid #d4c5b5", borderRadius: 4, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
            Reset {panelLang === "ar" ? "Arabic" : "English"} styles
          </button>
        </div>

        {extraContent && (
          <>
            <Divider title="Actions" />
            <div style={{ padding: "0 16px" }}>{extraContent}</div>
          </>
        )}
      </div>
    </div>
  );
}

// -- Legal content panel -------------------------------------------------------

const inpBase: React.CSSProperties = { width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "5px 8px", fontSize: 11, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" };
const lbl: React.CSSProperties = { display: "block", fontSize: 9, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 };

function LegalContentPanel({ content, activeTab, panelLang, setPanelLang, onTabChange, onSetContent }: {
  content: LegalPageData;
  activeTab: number;
  panelLang: "en" | "ar";
  setPanelLang: (l: "en" | "ar") => void;
  onTabChange: (i: number) => void;
  onSetContent: (c: LegalPageData) => void;
}) {
  const [expandedSec, setExpandedSec] = useState<number | null>(null);
  const tab = content.tabs[activeTab];

  useEffect(() => setExpandedSec(null), [activeTab]);

  function txt(b: ContentBlock) { return panelLang === "ar" ? (b.textAr ?? "") : b.text; }
  function setTxt(b: ContentBlock, v: string): ContentBlock { return panelLang === "ar" ? { ...b, textAr: v } : { ...b, text: v }; }
  function upd(fn: (c: LegalPageData) => void) {
    const clone = JSON.parse(JSON.stringify(content)) as LegalPageData;
    fn(clone);
    onSetContent(clone);
  }

  function linesText(sec: LegalSection) {
    return sec.lines.map((l) => txt(l)).join("\n");
  }
  function setLinesFromText(si: number, raw: string) {
    const lines = raw.split("\n").map((l) => mkBlock(l));
    upd((c) => { c.tabs[activeTab].sections[si].lines = lines; });
  }

  return (
    <div style={{ width: 360, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fafaf8", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "10px 14px", background: "#173946", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>Policy Content</span>
          <div style={{ display: "flex", gap: 3 }}>
            {(["en", "ar"] as const).map((l) => (
              <button key={l} onClick={() => setPanelLang(l)}
                style={{ padding: "3px 9px", border: `1px solid ${panelLang === l ? "#fff" : "rgba(255,255,255,0.3)"}`, borderRadius: 3, background: panelLang === l ? "#fff" : "transparent", color: panelLang === l ? "#173946" : "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", borderBottom: "2px solid #e8dfd4", flexShrink: 0, background: "#fff", overflowX: "auto" }}>
        {content.tabs.map((t, i) => (
          <button key={i} onClick={() => onTabChange(i)}
            style={{ flex: "0 0 auto", padding: "9px 14px", border: "none", background: "none", color: activeTab === i ? "#173946" : "#999", fontSize: 10, fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", borderBottom: activeTab === i ? "2px solid #173946" : "2px solid transparent", marginBottom: -2, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
            {txt(t.label) || `Tab ${i + 1}`}
          </button>
        ))}
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "0 0 40px" }}>

        {/* Tab label */}
        <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #ede5d8", background: "#fff" }}>
          <label style={lbl}>Tab Label</label>
          <input style={inpBase} value={txt(tab.label)} dir={panelLang === "ar" ? "rtl" : "ltr"}
            onChange={(e) => upd((c) => { c.tabs[activeTab].label = setTxt(c.tabs[activeTab].label, e.target.value); })} />
        </div>

        {/* Section cards */}
        <div style={{ padding: "10px 14px 4px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Sections ({tab.sections.length}) — click to edit
          </div>
        </div>

        {tab.sections.map((sec, si) => {
          const isOpen = expandedSec === si;
          const preview = linesText(sec).replace(/\n/g, " ").slice(0, 90);
          return (
            <div key={si} style={{ margin: "0 14px 8px", border: `1.5px solid ${isOpen ? "#173946" : "#e0d6ca"}`, borderRadius: 6, background: "#fff", overflow: "hidden" }}>
              {/* Card header — click to toggle */}
              <div
                onClick={() => setExpandedSec(isOpen ? null : si)}
                style={{ padding: "10px 12px", background: isOpen ? "#eaf3f6" : "#f5f0e8", display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", userSelect: "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#173946", lineHeight: 1.3 }}>
                    {txt(sec.title) || `Section ${si + 1}`}
                  </div>
                  {!isOpen && preview && (
                    <div style={{ fontSize: 10, color: "#999", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {preview}{linesText(sec).length > 90 ? "…" : ""}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: "#999" }}>{isOpen ? "▲" : "▼"}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); upd((c) => { c.tabs[activeTab].sections.splice(si, 1); if (expandedSec === si) setExpandedSec(null); }); }}
                    title="Delete section"
                    style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
                </div>
              </div>

              {/* Expanded editor */}
              {isOpen && (
                <div style={{ padding: "12px 12px 14px" }}>
                  <label style={lbl}>Section Title</label>
                  <input
                    style={{ ...inpBase, marginBottom: 10, fontWeight: 600 }}
                    value={txt(sec.title)} dir={panelLang === "ar" ? "rtl" : "ltr"}
                    placeholder="Section title"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => upd((c) => { c.tabs[activeTab].sections[si].title = setTxt(c.tabs[activeTab].sections[si].title, e.target.value); })} />
                  <label style={lbl}>Content <span style={{ color: "#aaa", textTransform: "none", fontWeight: 400 }}>(one item per line)</span></label>
                  <textarea
                    style={{ ...inpBase, resize: "vertical", minHeight: 180, lineHeight: 1.65, padding: "8px" }}
                    value={linesText(sec)}
                    dir={panelLang === "ar" ? "rtl" : "ltr"}
                    placeholder={"First line of content\nSecond line\nThird line…"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setLinesFromText(si, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}

        <div style={{ padding: "4px 14px 16px" }}>
          <button onClick={() => { upd((c) => { c.tabs[activeTab].sections.push({ title: mkBlock("New Section", "h2"), lines: [mkBlock("")] }); }); setExpandedSec(tab.sections.length); }}
            style={{ width: "100%", padding: "9px 0", background: "#173946", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            + Add Section
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Main component ------------------------------------------------------------

const DEFAULT_FOOTER: FooterData = {
  quote:          { text: "FRAGRANCE IS MEMORY, IDENTITY, AND EMOTION - CAPTURED IN A BOTTLE.", tag: "h2", style: {} },
  signatureTitle: { text: "FIND YOUR SIGNATURE SCENT", tag: "h3", style: {} },
  signatureCopy:  { text: "Discover fragrances that combine tradition, elegance, and modern expression.", tag: "p", style: {} },
  buttonText:     { text: "EXPLORE THE COLLECTION", tag: "span", style: {} },
  buttonLink:     "/shop",
  footerImage:    "",
};

export default function LegalPageEditorClient({ initialContent, initialFooterContent }: { initialContent: LegalPageData | null; initialFooterContent: FooterData | null }) {
  function mergeBlock(fromDB: ContentBlock | undefined, fallback: ContentBlock): ContentBlock {
    return fromDB?.text?.trim() ? fromDB : fallback;
  }
  const hasRealTabs = initialContent?.tabs?.some((t) => t.label?.text?.trim());
  const seed: LegalPageData = initialContent
    ? {
        heroTitle:    mergeBlock(initialContent.heroTitle, DEFAULT.heroTitle),
        heroSubtitle: mergeBlock(initialContent.heroSubtitle, DEFAULT.heroSubtitle!),
        heroImage:    initialContent.heroImage ?? "",
        tabs:         hasRealTabs ? initialContent.tabs : buildTabsFromTranslations(),
      }
    : DEFAULT;

  const [content, setContent]           = useState<LegalPageData>(seed);
  const [footerContent, setFooterContent] = useState<FooterData>(initialFooterContent ?? DEFAULT_FOOTER);
  const [previewLang, setPreviewLang]   = useState<"en" | "ar">("en");
  const [panelLang, setPanelLang]       = useState<"en" | "ar">("en");
  const [sel, setSel]                   = useState<string | null>(null);
  const [selImg, setSelImg]             = useState<string | null>(null);
  const [footerSel, setFooterSel]       = useState<string | null>(null);
  const [footerSelImg, setFooterSelImg] = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]   = useState<"saved" | "error" | null>(null);

  const canvasRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "legatee-legal-editor-styles";
    el.textContent = EDITOR_STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // highlight selected
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-sel").forEach((e) => e.classList.remove("legatee-sel"));
    if (sel) canvasRef.current.querySelectorAll(`[data-editable="${CSS.escape(sel)}"]`).forEach((e) => e.classList.add("legatee-sel"));
  }, [sel, content, activeTab]);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-img-sel").forEach((e) => e.classList.remove("legatee-img-sel"));
    if (selImg) canvasRef.current.querySelectorAll(`[data-editable-image="${CSS.escape(selImg)}"]`).forEach((e) => e.classList.add("legatee-img-sel"));
  }, [selImg, content]);

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    // Tab switch
    const tabEl = (e.target as HTMLElement).closest("[data-legal-tab]") as HTMLElement | null;
    if (tabEl) {
      const i = parseInt(tabEl.dataset.legalTab!);
      setActiveTab(i);
      setSel(null);
      return;
    }

    const txtEl = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (txtEl) {
      const key = txtEl.dataset.editable!;
      if (key.startsWith("footer.")) {
        setFooterSel((prev) => (prev === key ? null : key));
        setFooterSelImg(null); setSel(null); setSelImg(null);
      } else if (key === "heroTitle" || key === "heroSubtitle") {
        setSel(key); setFooterSel(null); setFooterSelImg(null); setSelImg(null);
      }
      // legal content (tabs.x.y) is edited directly in LegalContentPanel — no PropertiesPanel needed
      return;
    }

    const imgEl = (e.target as HTMLElement).closest("[data-editable-image]") as HTMLElement | null;
    if (imgEl) {
      const key = imgEl.dataset.editableImage!;
      if (key.startsWith("footer.")) {
        setFooterSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setSel(null); setSelImg(null);
      } else {
        setSelImg(key); setFooterSel(null); setFooterSelImg(null); setSel(null);
      }
      return;
    }

    setSel(null); setSelImg(null); setFooterSel(null); setFooterSelImg(null);
  }

  const onBlock = useCallback((key: string, block: ContentBlock) => {
    setContent((p) => setBlock(p, key, block));
    setStatus(null);
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const token = getCookie(ADMIN_COOKIE);
      const fd = new FormData();
      fd.append("image", file);
      if (footerSelImg) {
        const res = await adminFetch(`${API_URL}/api/footer/upload-image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        setFooterContent((prev) => ({ ...prev, footerImage: url }));
      } else {
        const res = await adminFetch(`${API_URL}/api/legalpage/upload-image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        setContent((p) => ({ ...p, heroImage: url }));
      }
      setStatus(null);
    } catch { alert("Upload failed. Please try again."); }
    finally { setUploading(false); }
  }

  async function save() {
    setSaving(true); setStatus(null);
    try {
      const [pageRes, footerRes] = await Promise.all([
        adminFetch(`${API_URL}/api/legalpage`, {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'dm-sans', ui-sans-serif, sans-serif" }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      {/* Top bar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", minHeight: 40, background: "#3B1814", flexShrink: 0, zIndex: 9999, gap: 6, flexWrap: "nowrap", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Link href="/legatee/admin/panel" style={{ color: "#c9a89a", fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>← Admin</Link>
          <span style={{ color: "#6b3329", fontSize: 11 }}>|</span>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Legal Editor</span>
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
          <Link href="/legal" target="_blank" style={{ padding: "3px 8px", border: "1px solid #6b3329", borderRadius: 4, color: "#c9a89a", fontSize: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
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
        <main ref={canvasRef} className="legatee-legal-editor" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} onClickCapture={handleCanvasClick}>
          <LanguageProvider defaultLang={previewLang}>
            <div style={{ pointerEvents: "none" }}><Navbar /></div>
            <Legal content={content} />
            <Footer content={footerContent} />
          </LanguageProvider>
        </main>

        {/* Right panel — overlay panels slide over the always-present content panel */}
        <div style={{ position: "relative", display: "flex", flexShrink: 0 }}>
          {/* Always-visible legal content panel */}
          <LegalContentPanel
            content={content}
            activeTab={activeTab}
            panelLang={panelLang}
            setPanelLang={setPanelLang}
            onTabChange={(i) => { setActiveTab(i); setSel(null); }}
            onSetContent={(c) => { setContent(c); setStatus(null); }}
          />

          {/* Overlay panels for hero text, hero image, footer */}
          {(sel || selImg || footerSel || footerSelImg) && (
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
              {footerSel
                ? <FooterTextPanel elKey={footerSel} footerContent={footerContent}
                    onBlock={(k, b) => { setFooterContent((p) => ({ ...p, [k]: b })); setStatus(null); }}
                    onLink={(k, v) => { setFooterContent((p) => ({ ...p, [k]: v })); setStatus(null); }}
                    previewLang={previewLang}
                    onClose={() => setFooterSel(null)} />
                : footerSelImg
                  ? <FooterImagePanel imageUrl={footerContent.footerImage ?? ""} uploading={uploading}
                      onUpload={() => fileInputRef.current?.click()}
                      onRevert={() => { setFooterContent((p) => ({ ...p, footerImage: "" })); setStatus(null); }}
                      onClose={() => setFooterSelImg(null)} />
                  : sel
                    ? <PropertiesPanel elKey={sel} content={content} onBlock={onBlock} previewLang={previewLang} onClose={() => setSel(null)} />
                    : selImg
                      ? (
                        <div style={{ width: "100%", height: "100%", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                          <div style={{ padding: "12px 16px", background: "#173946", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Hero Image</div>
                            <button onClick={() => setSelImg(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
                          </div>
                          <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
                            <div style={{ background: "#f5f0e8", borderRadius: 6, overflow: "hidden", aspectRatio: "16/7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                              {content.heroImage
                                ? <img src={content.heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>Using default image<br />(upload to replace)</span>
                              }
                            </div>
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                              style={{ width: "100%", padding: "11px 0", background: uploading ? "#e8e0d5" : "#173946", color: uploading ? "#aaa" : "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}>
                              {uploading ? "Uploading…" : "Replace image"}
                            </button>
                            {content.heroImage && (
                              <button onClick={() => { setContent((p) => ({ ...p, heroImage: "" })); setStatus(null); setSelImg(null); }}
                                style={{ marginTop: 10, width: "100%", padding: "8px 0", border: "1px solid #d4c5b5", borderRadius: 6, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
                                Revert to default
                              </button>
                            )}
                          </div>
                        </div>
                      )
                      : null
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
