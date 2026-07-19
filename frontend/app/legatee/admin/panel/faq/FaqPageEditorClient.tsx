"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader, getCookie, ADMIN_COOKIE } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { FaqPageData, ContentBlock, FooterData } from "@/lib/api";
import { FooterTextPanel, FooterImagePanel } from "../shared/FooterEditorPanel";
import { LanguageProvider } from "@/app/components/LanguageContext";
import { getArDefault } from "@/lib/ar-content-defaults";
import ConfirmModal from "@/app/legatee/admin/panel/_components/ConfirmModal";
import FaqHero from "@/app/components/Faq/FaqHero";
import FaqHelp from "@/app/components/Faq/FaqHelp";
import Navbar  from "@/app/components/Navbar";
import Footer  from "@/app/components/Footer";

// -- Editor styles -------------------------------------------------------------

const EDITOR_STYLES = `
  .legatee-faq-editor [data-editable] {
    cursor: pointer !important;
    outline: 1.5px dashed transparent;
    transition: outline-color 0.15s;
  }
  .legatee-faq-editor [data-editable]:hover {
    outline-color: #93c5fd !important;
    outline-offset: 3px;
  }
  .legatee-faq-editor [data-editable].legatee-sel {
    outline: 2.5px solid #3B82F6 !important;
    outline-offset: 3px;
  }
  .legatee-faq-editor [data-editable-image] {
    cursor: pointer !important;
  }
  .legatee-faq-editor [data-editable-image]:hover {
    outline: 1.5px dashed #93c5fd !important;
    outline-offset: 3px;
  }
  .legatee-faq-editor [data-editable-image].legatee-img-sel {
    outline: 2.5px solid #3B82F6 !important;
  }
  .legatee-faq-editor a,
  .legatee-faq-editor button:not([data-faq-toggle]) {
    pointer-events: none;
  }
  .legatee-faq-editor [data-faq-toggle],
  .legatee-faq-editor [data-editable],
  .legatee-faq-editor [data-editable-image] {
    pointer-events: auto !important;
  }
`;

// -- Helpers -------------------------------------------------------------------

const mkBlock = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

function getBlock(content: FaqPageData, key: string): ContentBlock | null {
  const parts = key.split(".");
  let node: any = content;
  for (const p of parts) { if (node == null) return null; node = node[p]; }
  return node as ContentBlock;
}

function setBlock(content: FaqPageData, key: string, block: ContentBlock): FaqPageData {
  const parts = key.split(".");
  const clone = JSON.parse(JSON.stringify(content)) as FaqPageData;
  let node: any = clone;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = block;
  return clone;
}

// button link keys map
const LINK_KEYS: Record<string, keyof FaqPageData> = {
  helpButtonText: "helpButtonLink",
};

// -- Defaults ------------------------------------------------------------------

const DEFAULT_ITEMS: FaqPageData["items"] = [
  { q: mkBlock("What makes LEGATEE fragrances unique?", "span"),        a: mkBlock("LEGATEE blends timeless Arabian scent traditions with refined, modern composition techniques — creating fragrances that feel both nostalgic and contemporary.") },
  { q: mkBlock("Are LEGATEE fragrances suitable for both men and women?", "span"), a: mkBlock("Yes. Our scents are designed as expressive, character-rich profiles that can be worn and enjoyed by anyone, regardless of gender.") },
  { q: mkBlock("What is the difference between Sadeem and Smoke of Arabia?", "span"), a: mkBlock("Sadeem is a warm, elegant composition with soft amber depth, while Smoke of Arabia is bolder and smokier — built around rich, resinous oud-inspired notes.") },
  { q: mkBlock("What is VELOURA Body & Hair Mist?", "span"),           a: mkBlock("VELOURA is a lightweight body and hair mist that delivers a gentle, lingering scent — perfect for refreshing throughout the day.") },
  { q: mkBlock("How long do LEGATEE perfumes last?", "span"),           a: mkBlock("Our eau de parfum concentrations are crafted for longevity, typically lasting 6–8 hours on skin depending on application and conditions.") },
  { q: mkBlock("How should I apply perfume for the best results?", "span"), a: mkBlock("Apply to pulse points such as the wrists, neck, and behind the ears where body heat helps the fragrance bloom throughout the day.") },
  { q: mkBlock("Are LEGATEE fragrances suitable for daily wear?", "span"), a: mkBlock("Absolutely. Our fragrances are designed to be versatile enough for everyday wear while still feeling special for evenings and occasions.") },
  { q: mkBlock("How should I store my fragrance?", "span"),            a: mkBlock("Store your fragrance in a cool, dry place away from direct sunlight and heat to preserve its scent and longevity.") },
  { q: mkBlock("Do you offer gifting options?", "span"),               a: mkBlock("Yes, LEGATEE offers elegant gift packaging for special occasions — perfect for surprising someone with a signature scent.") },
  { q: mkBlock("Where can I purchase LEGATEE products?", "span"),       a: mkBlock("You can purchase LEGATEE fragrances directly through our online store, with more stockists being added soon.") },
  { q: mkBlock("Do you offer nationwide or international shipping?", "span"), a: mkBlock("We currently ship nationwide across the UAE, with international shipping options expanding soon.") },
  { q: mkBlock("How long will my order take to arrive?", "span"),      a: mkBlock("Orders are typically processed within 1–2 business days and delivered within 3–5 business days, depending on your location.") },
  { q: mkBlock("How can I track my order?", "span"),                   a: mkBlock("Once your order ships, you'll receive a tracking link via email or SMS to follow its journey to your doorstep.") },
  { q: mkBlock("Can I return or exchange my fragrance?", "span"),      a: mkBlock("Yes, unopened and unused items can be returned or exchanged within 14 days of delivery. Please see our return policy for full details.") },
  { q: mkBlock("What should I do if my order arrives damaged or incorrect?", "span"), a: mkBlock("Please contact our support team within 48 hours of delivery with photos of the issue, and we'll arrange a replacement or refund promptly.") },
];

const DEFAULT: FaqPageData = {
  heroTitle:      mkBlock("FREQUENTLY ASKED QUESTIONS", "h1"),
  heroSubtitle:   mkBlock("Find answers to common questions about Legatee, our fragrances, orders, shipping, and product care. We're here to ensure your experience is as seamless as the scents we create."),
  heroImage:      "",
  items:          DEFAULT_ITEMS,
  helpIcon:       "",
  helpTitle:      mkBlock("CAN'T FIND WHAT YOU ARE LOOKING FOR?", "h2"),
  helpCopy:       mkBlock("Still have a question? We're always happy to assist. Contact our team and we'll help you find the information you need, ensuring your LEGATEE experience is seamless from start to finish."),
  helpButtonText: mkBlock("CONTACT US", "span"),
  helpButtonLink: "/contact-us",
};

// -- Label maps ----------------------------------------------------------------

const LABELS: Record<string, string> = {
  heroTitle:      "Page Heading",
  heroSubtitle:   "Page Subtitle",
  helpTitle:      "Section Heading",
  helpCopy:       "Section Copy",
  helpButtonText: "Button Text",
};

function getLabel(key: string) {
  if (key in LABELS) return LABELS[key];
  if (key.endsWith(".q")) return `Question ${parseInt(key.split(".")[1]) + 1}`;
  if (key.endsWith(".a")) return `Answer ${parseInt(key.split(".")[1]) + 1}`;
  return key;
}

function getSection(key: string) {
  if (key.startsWith("hero")) return "Hero Section";
  if (key.startsWith("items")) return "FAQ Item";
  return "Bottom Section";
}

// -- PropertiesPanel -----------------------------------------------------------

type StyleRecord = Record<string, string>;
type StyleKey    = keyof NonNullable<ContentBlock["style"]>;

const TAG_OPTS    = ["p","h1","h2","h3","h4","h5","h6","span"].map((t) => ({ label: t.toUpperCase(), value: t }));
const FONT_OPTS   = [{ label: "Default", value: "" }, { label: "Ivy Bodoni Condensed", value: "ivybodoni-condensed" }, { label: "DM Sans", value: "dm-sans" }];
const WEIGHT_OPTS = ["","300","400","500","600","700","800"].map((w) => ({ label: w || "Default", value: w }));
const ALIGN_OPTS  = ["","left","center","right","justify"].map((a) => ({ label: a || "Default", value: a }));

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
function SpacingGrid({ prefix, style, onChange }: { prefix: "margin" | "padding"; style: StyleRecord; onChange: (k: StyleKey, v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {(["Top","Right","Bottom","Left"] as const).map((side) => {
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

interface PPProps {
  elKey: string;
  content: FaqPageData;
  onBlock: (k: string, b: ContentBlock) => void;
  onLink: (k: string, v: string) => void;
  extraContent?: React.ReactNode;
  onClose: () => void;
}

function PropertiesPanel({ elKey, content, onBlock, onLink, extraContent, previewLang, onClose }: PPProps & { previewLang: "en" | "ar" }) {
  const [panelLang, setPanelLang] = useState<"en" | "ar">(previewLang);
  useEffect(() => setPanelLang(previewLang), [previewLang]);
  const block = getBlock(content, elKey);
  const style = (panelLang === "ar" ? (block?.styleAr ?? {}) : (block?.style ?? {})) as StyleRecord;
  const linkedKey = LINK_KEYS[elKey] ?? null;
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
    ? (panelLang === "ar" ? (block.textAr ?? getArDefault("faq", elKey)) : block.text)
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

          {/* Bold / Italic / Underline / Align toggles */}
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
            <PF label="Redirect URL">
              <PI value={(content as any)[linkedKey] || ""} onChange={(v) => onLink(String(linkedKey), v)} placeholder="/contact-us or https://…" />
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

        {/* Extra content (e.g. item management controls) */}
        {extraContent && (
          <>
            <Divider title="Item Actions" />
            <div style={{ padding: "0 16px" }}>{extraContent}</div>
          </>
        )}
      </div>
    </div>
  );
}

// -- Image panel ---------------------------------------------------------------

const IMAGE_LABELS: Record<string, string> = {
  heroImage: "Banner Image",
  helpIcon:  "Section Icon",
};

// -- Main component ------------------------------------------------------------

const DEFAULT_FOOTER: FooterData = {
  quote:          { text: "FRAGRANCE IS MEMORY, IDENTITY, AND EMOTION - CAPTURED IN A BOTTLE.", tag: "h2", style: {} },
  signatureTitle: { text: "FIND YOUR SIGNATURE SCENT", tag: "h3", style: {} },
  signatureCopy:  { text: "Discover fragrances that combine tradition, elegance, and modern expression.", tag: "p", style: {} },
  buttonText:     { text: "EXPLORE THE COLLECTION", tag: "span", style: {} },
  buttonLink:     "/shop",
  footerImage:    "",
};

export default function FaqPageEditorClient({ initialContent, initialFooterContent }: { initialContent: FaqPageData | null; initialFooterContent: FooterData | null }) {
  // Merge initialContent with defaults, falling back field-by-field when DB has empty ContentBlocks
  // (happens when DB was previously saved with the old string format and migrated to empty blocks)
  function mergeBlock(fromDB: ContentBlock | undefined, fallback: ContentBlock): ContentBlock {
    return fromDB?.text?.trim() ? fromDB : fallback;
  }
  const hasRealItems = initialContent?.items?.some((i) => i.q?.text?.trim());
  const seed: FaqPageData = initialContent
    ? {
        heroTitle:      mergeBlock(initialContent.heroTitle,      DEFAULT.heroTitle),
        heroSubtitle:   mergeBlock(initialContent.heroSubtitle,   DEFAULT.heroSubtitle),
        heroImage:      initialContent.heroImage      ?? "",
        items:          hasRealItems ? initialContent.items : DEFAULT_ITEMS,
        helpIcon:       initialContent.helpIcon        ?? "",
        helpTitle:      mergeBlock(initialContent.helpTitle,      DEFAULT.helpTitle),
        helpCopy:       mergeBlock(initialContent.helpCopy,       DEFAULT.helpCopy),
        helpButtonText: mergeBlock(initialContent.helpButtonText, DEFAULT.helpButtonText),
        helpButtonLink: initialContent.helpButtonLink  ?? DEFAULT.helpButtonLink,
      }
    : DEFAULT;

  const [content, setContent]           = useState<FaqPageData>(seed);
  const [footerContent, setFooterContent] = useState<FooterData>(initialFooterContent ?? DEFAULT_FOOTER);
  const [previewLang, setPreviewLang]   = useState<"en" | "ar">("en");
  const [sel, setSel]                   = useState<string | null>(null);
  const [selImg, setSelImg]             = useState<string | null>(null);
  const [footerSel, setFooterSel]       = useState<string | null>(null);
  const [footerSelImg, setFooterSelImg] = useState<string | null>(null);
  const [faqOpen, setFaqOpen]           = useState<number[]>([]);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]       = useState<"saved" | "error" | null>(null);
  const [newQ, setNewQ]           = useState("");
  const [newA, setNewA]           = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const dragFrom  = useRef<number | null>(null);
  const dragTo    = useRef<number | null>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "legatee-faq-editor-styles";
    el.textContent = EDITOR_STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // sync highlight classes
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-sel").forEach((e) => e.classList.remove("legatee-sel"));
    if (sel) canvasRef.current.querySelectorAll(`[data-editable="${CSS.escape(sel)}"]`).forEach((e) => e.classList.add("legatee-sel"));
  }, [sel, content]);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.querySelectorAll(".legatee-img-sel").forEach((e) => e.classList.remove("legatee-img-sel"));
    if (selImg) canvasRef.current.querySelectorAll(`[data-editable-image="${CSS.escape(selImg)}"]`).forEach((e) => e.classList.add("legatee-img-sel"));
  }, [selImg, content]);

  // -- Canvas click ------------------------------------------------------------

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    const faqToggle = (e.target as HTMLElement).closest("[data-faq-toggle]") as HTMLElement | null;
    if (faqToggle) {
      const i = parseInt(faqToggle.dataset.faqToggle!);
      setFaqOpen((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
      return;
    }

    const txtEl = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (txtEl) {
      const key = txtEl.dataset.editable!;
      if (key.startsWith("footer.")) {
        setFooterSel((prev) => (prev === key ? null : key));
        setFooterSelImg(null); setSel(null); setSelImg(null); setShowNewForm(false);
      } else {
        setSel((prev) => (prev === key ? null : key));
        setFooterSel(null); setFooterSelImg(null); setSelImg(null); setShowNewForm(false);
        const m = key.match(/^items\.(\d+)\.a$/);
        if (m) setFaqOpen((prev) => { const i = parseInt(m[1]); return prev.includes(i) ? prev : [...prev, i]; });
      }
      return;
    }

    const imgEl = (e.target as HTMLElement).closest("[data-editable-image]") as HTMLElement | null;
    if (imgEl) {
      const key = imgEl.dataset.editableImage!;
      if (key.startsWith("footer.")) {
        setFooterSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setSel(null); setSelImg(null); setShowNewForm(false);
      } else {
        setSelImg((prev) => (prev === key ? null : key));
        setFooterSel(null); setFooterSelImg(null); setSel(null); setShowNewForm(false);
      }
      return;
    }

    setSel(null); setSelImg(null); setFooterSel(null); setFooterSelImg(null);
  }

  // -- Drag handlers ------------------------------------------------------------

  function onDragStart(i: number) { dragFrom.current = i; }
  function onDragEnter(i: number) { dragTo.current = i; }
  function onDragEnd() {
    const from = dragFrom.current, to = dragTo.current;
    dragFrom.current = dragTo.current = null;
    if (from === null || to === null || from === to) return;
    setContent((prev) => {
      const items = [...prev.items];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { ...prev, items };
    });
    // keep sel in sync if editing an item
    if (sel) {
      const m = sel.match(/^items\.(\d+)\.(q|a)$/);
      if (m && parseInt(m[1]) === from) setSel(`items.${to}.${m[2]}`);
    }
    setStatus(null);
  }

  // -- Mutations -----------------------------------------------------------------

  const onBlock = useCallback((key: string, block: ContentBlock) => {
    setContent((p) => setBlock(p, key, block));
    setStatus(null);
  }, []);

  function onLink(key: string, val: string) {
    setContent((p) => ({ ...p, [key]: val }));
    setStatus(null);
  }

  function deleteItem(i: number) {
    setContent((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));
    setDeleteTarget(null);
    if (sel?.startsWith(`items.${i}.`)) setSel(null);
    setStatus(null);
  }

  function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= content.items.length) return;
    setContent((prev) => {
      const items = [...prev.items];
      [items[i], items[j]] = [items[j], items[i]];
      return { ...prev, items };
    });
    if (sel?.startsWith(`items.${i}.`)) setSel(sel.replace(`items.${i}.`, `items.${j}.`));
    setStatus(null);
  }

  function addItem() {
    if (!newQ.trim()) return;
    const newIdx = content.items.length;
    setContent((prev) => ({
      ...prev,
      items: [...prev.items, { q: mkBlock(newQ.trim(), "span"), a: mkBlock(newA.trim()) }],
    }));
    setSel(`items.${newIdx}.q`);
    setFaqOpen((prev) => [...prev, newIdx]);
    setNewQ(""); setNewA("");
    setShowNewForm(false);
    setStatus(null);
  }

  // -- Image upload -------------------------------------------------------------

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
        const res = await adminFetch(`${API_URL}/api/faqpage/upload-image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        const field = selImg === "helpIcon" ? "helpIcon" : "heroImage";
        setContent((prev) => ({ ...prev, [field]: url }));
      }
      setStatus(null);
    } catch { alert("Upload failed. Please try again."); }
    finally { setUploading(false); }
  }

  // -- Save ----------------------------------------------------------------------

  async function save() {
    setSaving(true); setStatus(null);
    try {
      const [pageRes, footerRes] = await Promise.all([
        adminFetch(`${API_URL}/api/faqpage`, {
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

  // -- Item controls (shown inside PropertiesPanel as extraContent) --------------

  const itemMatch = sel?.match(/^items\.(\d+)\.(q|a)$/);
  const itemIdx   = itemMatch ? parseInt(itemMatch[1]) : null;

  const itemControls = itemIdx !== null ? (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => moveItem(itemIdx, -1)} disabled={itemIdx === 0}
          style={{ flex: 1, padding: "7px 0", border: "1px solid #d4c5b5", borderRadius: 4, background: "#fff", color: itemIdx === 0 ? "#ccc" : "#3B1814", fontSize: 11, cursor: itemIdx === 0 ? "default" : "pointer" }}>
          ? Move up
        </button>
        <button onClick={() => moveItem(itemIdx, 1)} disabled={itemIdx === content.items.length - 1}
          style={{ flex: 1, padding: "7px 0", border: "1px solid #d4c5b5", borderRadius: 4, background: "#fff", color: itemIdx === content.items.length - 1 ? "#ccc" : "#3B1814", fontSize: 11, cursor: itemIdx === content.items.length - 1 ? "default" : "pointer" }}>
          ? Move down
        </button>
      </div>
      <button onClick={() => setDeleteTarget(itemIdx)}
        style={{ width: "100%", padding: "8px 0", border: "1px solid #fca5a5", borderRadius: 4, background: "#fff", color: "#c0392b", fontSize: 11, cursor: "pointer" }}>
        Delete this question
      </button>
      <div style={{ marginTop: 10, fontSize: 11, color: "#6f6459" }}>
        Q {itemIdx + 1} of {content.items.length} ·  Click question or answer to switch field
      </div>
    </div>
  ) : null;

  // -- Right panel: list view (shown when no text selected) ---------------------

  const listPanel = (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{showNewForm ? "New Question" : "All Questions"}</div>
        <button onClick={() => { setShowNewForm((v) => !v); setSel(null); setSelImg(null); }}
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", fontSize: 11, padding: "2px 10px", borderRadius: 4 }}>
          {showNewForm ? "← Back" : "+ New"}
        </button>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {showNewForm ? (
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Question</div>
              <textarea value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Type the question…"
                rows={3} style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "6px 8px", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5, fontFamily: "inherit" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Answer</div>
              <textarea value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Type the answer…"
                rows={5} style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "6px 8px", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5, fontFamily: "inherit" }} />
            </div>
            <button onClick={addItem} disabled={!newQ.trim()}
              style={{ width: "100%", padding: "11px 0", background: newQ.trim() ? "#3B1814" : "#e8e0d5", color: newQ.trim() ? "#fff" : "#aaa", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: newQ.trim() ? "pointer" : "not-allowed" }}>
              Add Question
            </button>
          </div>
        ) : (
          <div style={{ padding: "12px 8px" }}>
            <div style={{ padding: "0 8px 10px", fontSize: 11, color: "#6f6459" }}>Drag ? to reorder � Click to edit</div>
            {content.items.map((item, i) => (
              <div key={i} draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={() => onDragEnter(i)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => { setSel(`items.${i}.q`); setFaqOpen((prev) => prev.includes(i) ? prev : [...prev, i]); }}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 8px", marginBottom: 4, background: "#faf7f1", borderRadius: 6, cursor: "pointer", border: "1px solid #ede5d8", userSelect: "none" }}>
                <span style={{ fontSize: 16, color: "#c0aa92", cursor: "grab", flexShrink: 0, marginTop: 1 }}>☰</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#3B1814", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {i + 1}. {item.q.text || <em style={{ color: "#aaa" }}>No question</em>}
                  </div>
                  {item.a.text && <div style={{ fontSize: 11, color: "#6f6459", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{item.a.text}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid #ede5d8", fontSize: 10, color: "#aaa", flexShrink: 0 }}>
        {content.items.length} question{content.items.length !== 1 ? "s" : ""} · Click Save Changes to publish
      </div>
    </div>
  );

  // -- Image panel ---------------------------------------------------------------

  const imgUrl = selImg === "helpIcon" ? (content.helpIcon || "") : (content.heroImage || "");

  const imagePanel = selImg ? (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>Image</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{IMAGE_LABELS[selImg] ?? "Image"}</div>
        </div>
        <button onClick={() => setSelImg(null)} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
        <div style={{ background: "#f5f0e8", borderRadius: 6, overflow: "hidden", aspectRatio: "16/7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          {imgUrl
            ? <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>Using default image<br />(upload to replace)</span>
          }
        </div>
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
          style={{ width: "100%", padding: "11px 0", background: uploading ? "#e8e0d5" : "#3B1814", color: uploading ? "#aaa" : "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}>
          {uploading ? "Uploading…" : "?  Replace image"}
        </button>
        {imgUrl && (
          <button onClick={() => { setContent((p) => ({ ...p, [selImg]: "" })); setStatus(null); }}
            style={{ marginTop: 10, width: "100%", padding: "8px 0", border: "1px solid #d4c5b5", borderRadius: 6, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
            ← Revert to default
          </button>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'dm-sans', ui-sans-serif, sans-serif" }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete question?"
        message={deleteTarget !== null ? `"${content.items[deleteTarget]?.q?.text || "This question"}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        danger
        onConfirm={() => deleteTarget !== null && deleteItem(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Top bar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", minHeight: 40, background: "#3B1814", flexShrink: 0, zIndex: 9999, gap: 6, flexWrap: "nowrap", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Link href="/legatee/admin/panel" style={{ color: "#c9a89a", fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>← Admin</Link>
          <span style={{ color: "#6b3329", fontSize: 11 }}>|</span>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>FAQ Editor</span>
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
          <button onClick={() => { setShowNewForm(true); setSel(null); setSelImg(null); }}
            style={{ padding: "3px 10px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            + Add Q
          </button>
          <Link href="/faq" target="_blank" style={{ padding: "3px 8px", border: "1px solid #6b3329", borderRadius: 4, color: "#c9a89a", fontSize: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
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
        <main ref={canvasRef} className="legatee-faq-editor" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} onClickCapture={handleCanvasClick}>
          <LanguageProvider defaultLang={previewLang}>
            <div style={{ pointerEvents: "none" }}><Navbar /></div>
            <FaqHero content={content} openItems={faqOpen} />
            <FaqHelp content={content} />
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
              ? <PropertiesPanel elKey={sel} content={content} onBlock={onBlock} onLink={onLink} extraContent={itemControls} previewLang={previewLang} onClose={() => setSel(null)} />
              : selImg
                ? imagePanel
                : listPanel
        }
      </div>
    </div>
  );
}
