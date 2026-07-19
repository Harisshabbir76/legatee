"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader, getCookie, ADMIN_COOKIE } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { ContactPageData, ContentBlock, FooterData } from "@/lib/api";
import { FooterTextPanel, FooterImagePanel } from "../shared/FooterEditorPanel";
import { LanguageProvider } from "@/app/components/LanguageContext";
import { getArDefault } from "@/lib/ar-content-defaults";
import ContactUsHero from "@/app/components/contact-us/ContactUsHero";
import ContactUsForm from "@/app/components/contact-us/ContactUsForm";
import InstagramSection from "@/app/components/contact-us/InstagramSection";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// -- Editor styles -------------------------------------------------------------

const EDITOR_STYLES = `
  .legatee-contact-editor [data-editable] {
    cursor: pointer !important;
    outline: 1.5px dashed transparent;
    transition: outline-color 0.15s;
  }
  .legatee-contact-editor [data-editable]:hover {
    outline-color: #93c5fd !important;
    outline-offset: 2px;
  }
  .legatee-contact-editor [data-editable].legatee-sel {
    outline: 2.5px solid #3B82F6 !important;
    outline-offset: 2px;
  }
  .legatee-contact-editor [data-editable-image] {
    cursor: pointer !important;
    transition: outline-color 0.15s;
  }
  .legatee-contact-editor [data-editable-image]:hover {
    outline: 1.5px dashed #93c5fd !important;
    outline-offset: 3px;
  }
  .legatee-contact-editor [data-editable-image].legatee-img-sel {
    outline: 2.5px solid #3B82F6 !important;
  }
  .legatee-contact-editor a,
  .legatee-contact-editor button:not([type="submit"]) {
    pointer-events: none;
  }
  .legatee-contact-editor [data-editable],
  .legatee-contact-editor [data-editable-image],
  .legatee-contact-editor button[type="submit"][data-editable] {
    pointer-events: auto !important;
  }
  .legatee-contact-editor input,
  .legatee-contact-editor textarea {
    pointer-events: none;
  }
`;

// -- Helpers -------------------------------------------------------------------

const mkBlock = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

// -- Defaults ------------------------------------------------------------------

const DEFAULT: ContactPageData = {
  heroTitle:           mkBlock("CONTACT US", "h1"),
  heroImage:           "",
  formTitle:           mkBlock("We'd Love to Hear From You", "h2"),
  formCopy:            mkBlock("Every fragrance tells a story, and every conversation begins a new one. Whether you're exploring our collection, seeking support, or sharing your thoughts, we're here to assist. Connect with us and discover the world of LEGATEE."),
  submitButtonText:    mkBlock("SEND YOUR MESSAGE", "span"),
  instagramTitle:      mkBlock("CONNECT WITH US ON INSTAGRAM", "h2"),
  instagramCopy:       mkBlock("Explore our latest fragrances, behind-the-scenes moments, and sensory inspiration. Follow along and immerse yourself in the world of LEGATEE."),
  instagramHandle:     mkBlock("@legatee_ae", "span"),
  instagramHandleLink: "https://www.instagram.com/",
  igImage1: "", igImage2: "", igImage3: "", igImage4: "",
  igImage5: "", igImage6: "", igImage7: "",
};

// -- Label / section maps ------------------------------------------------------

const LABELS: Record<string, string> = {
  heroTitle:        "Page Heading",
  formTitle:        "Form Heading",
  formCopy:         "Form Description",
  submitButtonText: "Submit Button",
  instagramTitle:   "Instagram Heading",
  instagramCopy:    "Instagram Description",
  instagramHandle:  "Instagram Handle",
};
const SECTIONS: Record<string, string> = {
  heroTitle:        "Hero Section",
  formTitle:        "Contact Form",
  formCopy:         "Contact Form",
  submitButtonText: "Contact Form",
  instagramTitle:   "Instagram Section",
  instagramCopy:    "Instagram Section",
  instagramHandle:  "Instagram Section",
};
const IG_IMAGE_LABELS: Record<string, string> = {
  heroImage: "Banner Image",
  igImage1: "Instagram Photo 1", igImage2: "Instagram Photo 2",
  igImage3: "Instagram Photo 3", igImage4: "Instagram Photo 4",
  igImage5: "Instagram Photo 5", igImage6: "Instagram Photo 6",
  igImage7: "Instagram Photo 7",
};

// Keys that also have a link field
const LINK_KEYS: Partial<Record<keyof ContactPageData, keyof ContactPageData>> = {
  instagramHandle: "instagramHandleLink",
};

// -- PropertiesPanel -----------------------------------------------------------

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
      {(["Top","Right","Bottom","Left"] as const).map((side) => {
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

interface PPProps {
  elKey: keyof ContactPageData;
  content: ContactPageData;
  onBlock: (k: keyof ContactPageData, b: ContentBlock) => void;
  onLink:  (k: keyof ContactPageData, v: string) => void;
  onClose: () => void;
}

function PropertiesPanel({ elKey, content, onBlock, onLink, previewLang, onClose }: PPProps & { previewLang: "en" | "ar" }) {
  const [panelLang, setPanelLang] = useState<"en" | "ar">(previewLang);
  useEffect(() => setPanelLang(previewLang), [previewLang]);
  const block = content[elKey] as ContentBlock | undefined;
  if (!block || typeof block !== "object" || !("text" in block)) return null;

  const style = (panelLang === "ar" ? (block.styleAr ?? {}) : (block.style ?? {})) as Record<string, string>;
  const linkedKey = LINK_KEYS[elKey] ?? null;
  const editorRef = useRef<HTMLDivElement>(null);

  function us(k: string, v: string) {
    if (panelLang === "ar") {
      const newStyleAr = { ...(block!.styleAr ?? {}) } as Record<string, string>;
      if (v) newStyleAr[k] = v; else delete newStyleAr[k];
      onBlock(elKey, { ...block!, styleAr: newStyleAr });
    } else {
      const newStyle = { ...(block!.style ?? {}) } as Record<string, string>;
      if (v) newStyle[k] = v; else delete newStyle[k];
      onBlock(elKey, { ...block!, style: newStyle });
    }
  }

  const currentEditorVal = block
    ? (panelLang === "ar" ? (block.textAr ?? getArDefault("contact", String(elKey))) : block.text)
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
      <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>{SECTIONS[elKey] ?? ""}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{LABELS[elKey] ?? String(elKey)}</div>
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

          {linkedKey && (
            <PF label="Link URL">
              <PI value={(content[linkedKey] as string) || ""} onChange={(v) => onLink(linkedKey, v)} placeholder="https://www.instagram.com/�" />
            </PF>
          )}
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
      </div>
    </div>
  );
}

// -- Overview panel ------------------------------------------------------------

const TEXT_FIELDS: { key: keyof ContactPageData; label: string; section: string }[] = [
  { key: "heroTitle",        label: "Page Heading",           section: "Hero" },
  { key: "formTitle",        label: "Form Heading",           section: "Form" },
  { key: "formCopy",         label: "Form Description",       section: "Form" },
  { key: "submitButtonText", label: "Submit Button Text",     section: "Form" },
  { key: "instagramTitle",   label: "Instagram Heading",      section: "Instagram" },
  { key: "instagramCopy",    label: "Instagram Description",  section: "Instagram" },
  { key: "instagramHandle",  label: "Instagram Handle / Link","section": "Instagram" },
];
const IMAGE_FIELDS: { key: keyof ContactPageData; label: string }[] = [
  { key: "heroImage", label: "Banner Image" },
  { key: "igImage1",  label: "Instagram Photo 1" },
  { key: "igImage2",  label: "Instagram Photo 2" },
  { key: "igImage3",  label: "Instagram Photo 3" },
  { key: "igImage4",  label: "Instagram Photo 4" },
  { key: "igImage5",  label: "Instagram Photo 5" },
  { key: "igImage6",  label: "Instagram Photo 6" },
  { key: "igImage7",  label: "Instagram Photo 7" },
];

function OverviewPanel({ onSetSel, onSetSelImg }: { onSetSel: (k: keyof ContactPageData) => void; onSetSelImg: (k: keyof ContactPageData) => void }) {
  const sections = ["Hero", "Form", "Instagram"];
  return (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#3B1814", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Page Elements</div>
        
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {sections.map((sec) => {
          const textInSec = TEXT_FIELDS.filter((f) => f.section === sec);
          const imgInSec  = IMAGE_FIELDS.filter((f) => {
            if (sec === "Hero")      return f.key === "heroImage";
            if (sec === "Instagram") return f.key !== "heroImage";
            return false;
          });
          return (
            <div key={sec} style={{ borderBottom: "1px solid #f0e8dc" }}>
              <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.06em" }}>{sec}</div>
              {textInSec.map((f) => (
                <div key={String(f.key)} onClick={() => onSetSel(f.key)}
                  style={{ padding: "6px 12px 6px 20px", cursor: "pointer", fontSize: 11, color: "#3B1814", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#c0aa92", fontSize: 10 }}>T</span> {f.label}
                </div>
              ))}
              {imgInSec.map((f) => (
                <div key={String(f.key)} onClick={() => onSetSelImg(f.key)}
                  style={{ padding: "6px 12px 6px 20px", cursor: "pointer", fontSize: 11, color: "#3B1814", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#c0aa92", fontSize: 10 }}>?</span> {f.label}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Image panel ---------------------------------------------------------------

interface ImgPanelProps {
  imgKey: keyof ContactPageData;
  content: ContactPageData;
  uploading: boolean;
  onUpload: () => void;
  onRevert: () => void;
  onClose: () => void;
}

function ImagePanel({ imgKey, content, uploading, onUpload, onRevert, onClose }: ImgPanelProps) {
  const url = (content[imgKey] as string) || "";
  return (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>Image</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{IG_IMAGE_LABELS[String(imgKey)] ?? String(imgKey)}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
        <div style={{ background: "#f5f0e8", borderRadius: 6, overflow: "hidden", aspectRatio: imgKey === "heroImage" ? "16/7" : "1/1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          {url
            ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>Using default image<br />(upload to replace)</span>
          }
        </div>
        <button onClick={onUpload} disabled={uploading}
          style={{ width: "100%", padding: "11px 0", background: uploading ? "#e8e0d5" : "#3B1814", color: uploading ? "#aaa" : "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}>
          {uploading ? "Uploading…" : "?  Replace image"}
        </button>
        {url && (
          <button onClick={onRevert}
            style={{ marginTop: 10, width: "100%", padding: "8px 0", border: "1px solid #d4c5b5", borderRadius: 6, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
            ← Revert to default
          </button>
        )}
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

export default function ContactPageEditorClient({ initialContent, initialFooterContent }: { initialContent: ContactPageData | null; initialFooterContent: FooterData | null }) {
  function mb(fromDB: ContentBlock | undefined, fallback: ContentBlock): ContentBlock {
    return fromDB?.text?.trim() ? fromDB : fallback;
  }
  const seed: ContactPageData = initialContent
    ? {
        ...initialContent,
        heroTitle:        mb(initialContent.heroTitle,        DEFAULT.heroTitle),
        formTitle:        mb(initialContent.formTitle,        DEFAULT.formTitle),
        formCopy:         mb(initialContent.formCopy,         DEFAULT.formCopy),
        submitButtonText: mb(initialContent.submitButtonText, DEFAULT.submitButtonText),
        instagramTitle:   mb(initialContent.instagramTitle,   DEFAULT.instagramTitle),
        instagramCopy:    mb(initialContent.instagramCopy,    DEFAULT.instagramCopy),
        instagramHandle:  mb(initialContent.instagramHandle,  DEFAULT.instagramHandle),
      }
    : DEFAULT;

  const [content, setContent]             = useState<ContactPageData>(seed);
  const [footerContent, setFooterContent] = useState<FooterData>(initialFooterContent ?? DEFAULT_FOOTER);
  const [previewLang, setPreviewLang]     = useState<"en" | "ar">("en");
  const [sel, setSel]                     = useState<keyof ContactPageData | null>(null);
  const [selImg, setSelImg]               = useState<keyof ContactPageData | null>(null);
  const [footerSel, setFooterSel]         = useState<string | null>(null);
  const [footerSelImg, setFooterSelImg]   = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [status, setStatus]               = useState<"saved" | "error" | null>(null);
  const [activeUploadKey, setActiveUploadKey] = useState<keyof ContactPageData>("heroImage");

  const canvasRef   = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "legatee-contact-editor-styles";
    el.textContent = EDITOR_STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // highlight selected text
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-sel").forEach((e) => e.classList.remove("legatee-sel"));
    if (sel) canvasRef.current.querySelectorAll(`[data-editable="${CSS.escape(String(sel))}"]`).forEach((e) => e.classList.add("legatee-sel"));
  }, [sel, content]);

  // highlight selected image
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-img-sel").forEach((e) => e.classList.remove("legatee-img-sel"));
    if (selImg) canvasRef.current.querySelectorAll(`[data-editable-image="${CSS.escape(String(selImg))}"]`).forEach((e) => e.classList.add("legatee-img-sel"));
  }, [selImg, content]);

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    const txtEl = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (txtEl) {
      const key = txtEl.dataset.editable!;
      if (key.startsWith("footer.")) {
        setFooterSel((prev) => (prev === key ? null : key));
        setFooterSelImg(null); setSel(null); setSelImg(null);
      } else {
        setSel(key as keyof ContactPageData); setFooterSel(null); setFooterSelImg(null); setSelImg(null);
      }
      return;
    }

    const imgEl = (e.target as HTMLElement).closest("[data-editable-image]") as HTMLElement | null;
    if (imgEl) {
      const key = imgEl.dataset.editableImage!;
      if (key.startsWith("footer.")) {
        setFooterSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setSel(null); setSelImg(null);
      } else {
        setSelImg(key as keyof ContactPageData); setFooterSel(null); setFooterSelImg(null); setSel(null);
      }
      return;
    }

    setSel(null); setSelImg(null); setFooterSel(null); setFooterSelImg(null);
  }

  const onBlock = useCallback((key: keyof ContactPageData, block: ContentBlock) => {
    setContent((p) => ({ ...p, [key]: block }));
    setStatus(null);
  }, []);

  function onLink(key: keyof ContactPageData, val: string) {
    setContent((p) => ({ ...p, [key]: val }));
    setStatus(null);
  }

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
        const res = await adminFetch(`${API_URL}/api/contactpage/upload-image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        setContent((p) => ({ ...p, [activeUploadKey]: url }));
      }
      setStatus(null);
    } catch { alert("Upload failed. Please try again."); }
    finally { setUploading(false); }
  }

  function triggerUpload(key: keyof ContactPageData) {
    setActiveUploadKey(key);
    setTimeout(() => fileInputRef.current?.click(), 0);
  }

  async function save() {
    setSaving(true); setStatus(null);
    try {
      const [pageRes, footerRes] = await Promise.all([
        adminFetch(`${API_URL}/api/contactpage`, {
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
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Contact Us Editor</span>
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
          <Link href="/contact-us" target="_blank" style={{ padding: "3px 8px", border: "1px solid #6b3329", borderRadius: 4, color: "#c9a89a", fontSize: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
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
        <main ref={canvasRef} className="legatee-contact-editor" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} onClickCapture={handleCanvasClick}>
          <LanguageProvider defaultLang={previewLang}>
            <div style={{ pointerEvents: "none" }}><Navbar /></div>
            <ContactUsHero content={content} />
            <ContactUsForm content={content} />
            <InstagramSection content={content} />
            <Footer content={footerContent} />
          </LanguageProvider>
        </main>

        {/* Right panel */}
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
              ? <PropertiesPanel elKey={sel} content={content} onBlock={onBlock} onLink={onLink} previewLang={previewLang} onClose={() => setSel(null)} />
              : selImg
                ? <ImagePanel imgKey={selImg} content={content} uploading={uploading}
                    onUpload={() => triggerUpload(selImg)}
                    onRevert={() => { setContent((p) => ({ ...p, [selImg]: "" })); setStatus(null); }}
                    onClose={() => setSelImg(null)} />
                : <OverviewPanel onSetSel={setSel} onSetSelImg={setSelImg} />
        }
      </div>
    </div>
  );
}
