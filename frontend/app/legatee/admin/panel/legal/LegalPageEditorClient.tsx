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
import ConfirmModal from "@/app/legatee/admin/panel/_components/ConfirmModal";
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

const line = (text: string) => mkBlock(text);

const DEFAULT_TABS: LegalTab[] = [
  {
    label: mkBlock("PRIVACY POLICY", "span"),
    intro: mkBlock("At LEGATEE, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, place an order, or interact with our services. By using our website, you agree to the practices described in this Privacy Policy."),
    sections: [
      { title: mkBlock("Information We Collect", "h2"), lines: [line("We may collect personal information that you voluntarily provide, including:"), line("Full name"), line("Email address"), line("Phone number"), line("Shipping and billing address"), line("Payment information"), line("Order history"), line("Information submitted through contact forms")] },
      { title: mkBlock("We may also collect certain non-personal information automatically, such as:", "h2"), lines: [line("IP address"), line("Browser type"), line("Device information"), line("Website usage data"), line("Cookies and analytics information")] },
      { title: mkBlock("How We Use Your Information", "h2"), lines: [line("We use the information we collect to:"), line("Process and fulfill orders"), line("Provide customer support"), line("Communicate order updates and confirmations"), line("Improve our website and services"), line("Respond to inquiries and requests"), line("Send marketing communications (with your consent)"), line("Maintain website security and prevent fraudulent activity")] },
      { title: mkBlock("Payment Security", "h2"), lines: [line("We do not store your complete payment card information on our servers. Payments are processed through trusted third-party payment providers that use industry-standard security measures to protect your information.")] },
      { title: mkBlock("Sharing of Information", "h2"), lines: [line("We do not sell, rent, or trade your personal information."), line("We may share information with trusted third-party service providers when necessary to:"), line("Process payments"), line("Deliver orders"), line("Provide website hosting and maintenance"), line("Conduct analytics and performance monitoring"), line("These service providers are required to keep your information secure and confidential.")] },
      { title: mkBlock("Cookies", "h2"), lines: [line("Our website may use cookies and similar technologies to enhance your browsing experience, remember preferences, and analyze website traffic."), line("You may choose to disable cookies through your browser settings; however, some features of the website may not function properly.")] },
      { title: mkBlock("Data Protection", "h2"), lines: [line("We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction."), line("While we strive to protect your information, no online transmission or storage system can be guaranteed to be completely secure.")] },
      { title: mkBlock("Third-Party Links", "h2"), lines: [line("Our website may contain links to third-party websites."), line("We are not responsible for the privacy practices or content of external websites."), line("We encourage users to review the privacy policies of any third-party sites they visit.")] },
      { title: mkBlock("Your Rights", "h2"), lines: [line("Depending on applicable laws, you may have the right to:"), line("Access your personal information"), line("Request correction of inaccurate information"), line("Request deletion of your personal information"), line("Withdraw consent for marketing communications"), line("Request information about how your data is used"), line("To exercise these rights, please contact us using the details provided below.")] },
      { title: mkBlock("Changes to This Policy", "h2"), lines: [line("LEGATEE reserves the right to update this Privacy Policy at any time."), line("Any changes will be posted on this page with an updated revision date.")] },
      { title: mkBlock("Contact Us", "h2"), lines: [line("If you have any questions regarding this Privacy Policy or the handling of your personal information, please contact us:"), line("Email: [Your Email Address]"), line("Phone: [Your Phone Number]"), line("Address: [Your Business Address]"), line("We will be happy to assist you.")] },
    ],
  },
  {
    label: mkBlock("TERMS & CONDITIONS", "span"),
    intro: mkBlock("By using the LEGATEE website, you agree to the terms and conditions outlined below. Please read them carefully before browsing, purchasing, or using our services."),
    sections: [
      { title: mkBlock("Use of Website", "h2"), lines: [line("You agree to use this website only for lawful purposes."), line("You may not misuse the website, interfere with its security, or attempt to access restricted areas.")] },
      { title: mkBlock("Product Information", "h2"), lines: [line("We aim to display product details, pricing, and availability as accurately as possible."), line("Colors, packaging, and descriptions may vary slightly due to screen settings or product updates.")] },
      { title: mkBlock("Orders and Payments", "h2"), lines: [line("All orders are subject to acceptance and availability."), line("LEGATEE reserves the right to cancel or refuse an order if payment, stock, or account details cannot be verified.")] },
      { title: mkBlock("Intellectual Property", "h2"), lines: [line("All website content, including text, imagery, logos, product names, and design elements, belongs to LEGATEE and may not be copied or used without permission.")] },
    ],
  },
  {
    label: mkBlock("PRODUCTS RETURN", "span"),
    intro: mkBlock("We want you to be pleased with your LEGATEE experience. Please review our product return guidelines before requesting an exchange or return."),
    sections: [
      { title: mkBlock("Return Eligibility", "h2"), lines: [line("Products must be unused, unopened, and returned in their original packaging."), line("Returns may be requested within the stated return window after delivery.")] },
      { title: mkBlock("Damaged or Incorrect Orders", "h2"), lines: [line("If your order arrives damaged or incorrect, contact our team with your order number and clear photos of the item and packaging."), line("We will review the issue and guide you through the next steps.")] },
      { title: mkBlock("Non-Returnable Items", "h2"), lines: [line("Opened fragrances, used body mists, promotional items, and products without original packaging may not be eligible for return.")] },
      { title: mkBlock("Processing", "h2"), lines: [line("Approved returns or exchanges are processed after the returned item is received and inspected."), line("Shipping fees may be non-refundable unless the return is due to an error from our side.")] },
    ],
  },
];

const DEFAULT: LegalPageData = {
  heroTitle: mkBlock("LEGAL", "h1"),
  heroImage: "",
  tabs: DEFAULT_TABS,
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
  if (key === "heroTitle") return "Page Heading";
  if (/^tabs\.\d+\.label$/.test(key)) return `Tab ${parseInt(key.split(".")[1]) + 1} Label`;
  if (/^tabs\.\d+\.intro$/.test(key)) return `Tab ${parseInt(key.split(".")[1]) + 1} Intro`;
  if (/^tabs\.\d+\.sections\.\d+\.title$/.test(key)) { const [,t,,s] = key.split("."); return `Tab ${+t+1} � Section ${+s+1} Title`; }
  if (/^tabs\.\d+\.sections\.\d+\.lines\.\d+$/.test(key)) { const [,t,,s,,l] = key.split("."); return `Tab ${+t+1} � �${+s+1} � Line ${+l+1}`; }
  return key;
}
function getSection(key: string) {
  if (key === "heroTitle") return "Hero";
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

// -- Structure panel (right panel when nothing selected) -----------------------

function StructurePanel({
  content, activeTab, onTabChange, onSetContent, onSetSel,
}: {
  content: LegalPageData;
  activeTab: number;
  onTabChange: (i: number) => void;
  onSetContent: (c: LegalPageData) => void;
  onSetSel: (k: string) => void;
}) {
  const tab = content.tabs[activeTab];

  function addSection() {
    const clone = JSON.parse(JSON.stringify(content)) as LegalPageData;
    clone.tabs[activeTab].sections.push({ title: mkBlock("New Section", "h2"), lines: [mkBlock("New line text")] });
    onSetContent(clone);
    const si = clone.tabs[activeTab].sections.length - 1;
    onSetSel(`tabs.${activeTab}.sections.${si}.title`);
  }

  function deleteSection(si: number) {
    const clone = JSON.parse(JSON.stringify(content)) as LegalPageData;
    clone.tabs[activeTab].sections.splice(si, 1);
    onSetContent(clone);
  }

  function addLine(si: number) {
    const clone = JSON.parse(JSON.stringify(content)) as LegalPageData;
    clone.tabs[activeTab].sections[si].lines.push(mkBlock("New line text"));
    onSetContent(clone);
    const li = clone.tabs[activeTab].sections[si].lines.length - 1;
    onSetSel(`tabs.${activeTab}.sections.${si}.lines.${li}`);
  }

  function deleteLine(si: number, li: number) {
    const clone = JSON.parse(JSON.stringify(content)) as LegalPageData;
    clone.tabs[activeTab].sections[si].lines.splice(li, 1);
    onSetContent(clone);
  }

  return (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#3B1814", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Page Structure</div>

      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", borderBottom: "1px solid #ede5d8", flexShrink: 0 }}>
        {content.tabs.map((t, i) => (
          <button key={i} onClick={() => onTabChange(i)}
            style={{ flex: 1, padding: "8px 4px", border: "none", background: activeTab === i ? "#faf7f1" : "#fff", color: activeTab === i ? "#3B1814" : "#6f6459", fontSize: 10, fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", borderBottom: activeTab === i ? "2px solid #3B1814" : "2px solid transparent" }}>
            {i + 1}
          </button>
        ))}
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {/* Tab label & intro */}
        <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid #f0e8dc" }}>
          <div onClick={() => onSetSel(`tabs.${activeTab}.label`)}
            style={{ padding: "5px 8px", marginBottom: 4, borderRadius: 4, background: "#f5f0e8", cursor: "pointer", fontSize: 11, color: "#3B1814", fontWeight: 600 }}>
            ? Tab label: {tab.label.text}
          </div>
          <div onClick={() => onSetSel(`tabs.${activeTab}.intro`)}
            style={{ padding: "5px 8px", borderRadius: 4, background: "#f5f0e8", cursor: "pointer", fontSize: 11, color: "#6f6459", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            ? Intro: {tab.intro.text.slice(0, 50)}�
          </div>
        </div>

        {/* Sections */}
        {tab.sections.map((section, si) => (
          <div key={si} style={{ borderBottom: "1px solid #f0e8dc" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 12px 4px", gap: 6 }}>
              <div onClick={() => onSetSel(`tabs.${activeTab}.sections.${si}.title`)}
                style={{ flex: 1, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#3B1814", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                � {si + 1}: {section.title.text}
              </div>
              <button onClick={() => addLine(si)}
                style={{ background: "none", border: "1px solid #d4c5b5", borderRadius: 3, fontSize: 10, color: "#3B1814", cursor: "pointer", padding: "2px 6px", flexShrink: 0 }}>
                + Line
              </button>
              <button onClick={() => deleteSection(si)}
                style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 14, padding: "0 2px", flexShrink: 0 }}>
                �
              </button>
            </div>
            {section.lines.map((ln, li) => (
              <div key={li} style={{ display: "flex", alignItems: "center", padding: "3px 12px 3px 24px", gap: 4 }}>
                <span onClick={() => onSetSel(`tabs.${activeTab}.sections.${si}.lines.${li}`)}
                  style={{ flex: 1, cursor: "pointer", fontSize: 10, color: "#6f6459", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  � {ln.text || "(empty)"}
                </span>
                <button onClick={() => deleteLine(si, li)}
                  style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 12, padding: "0 2px", flexShrink: 0 }}>
                  �
                </button>
              </div>
            ))}
          </div>
        ))}

        <div style={{ padding: 12 }}>
          <button onClick={addSection}
            style={{ width: "100%", padding: "9px 0", background: "#3B1814", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
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
        heroTitle: mergeBlock(initialContent.heroTitle, DEFAULT.heroTitle),
        heroImage: initialContent.heroImage ?? "",
        tabs: hasRealTabs ? initialContent.tabs : DEFAULT_TABS,
      }
    : DEFAULT;

  const [content, setContent]           = useState<LegalPageData>(seed);
  const [footerContent, setFooterContent] = useState<FooterData>(initialFooterContent ?? DEFAULT_FOOTER);
  const [previewLang, setPreviewLang]   = useState<"en" | "ar">("en");
  const [sel, setSel]                   = useState<string | null>(null);
  const [selImg, setSelImg]             = useState<string | null>(null);
  const [footerSel, setFooterSel]       = useState<string | null>(null);
  const [footerSelImg, setFooterSelImg] = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]   = useState<"saved" | "error" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "section"; ti: number; si: number } | { type: "line"; ti: number; si: number; li: number } | null>(null);

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
      } else {
        setSel(key); setFooterSel(null); setFooterSelImg(null); setSelImg(null);
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

  // Parse selected key to detect if it's a section/line for extra controls
  const sectionMatch = sel?.match(/^tabs\.(\d+)\.sections\.(\d+)\.title$/);
  const lineMatch    = sel?.match(/^tabs\.(\d+)\.sections\.(\d+)\.lines\.(\d+)$/);

  let extraContent: React.ReactNode = null;
  if (sectionMatch) {
    const [, ti, si] = sectionMatch.map(Number);
    extraContent = (
      <div>
        <button onClick={() => setDeleteTarget({ type: "section", ti, si })}
          style={{ width: "100%", padding: "8px 0", border: "1px solid #fca5a5", borderRadius: 4, background: "#fff", color: "#c0392b", fontSize: 11, cursor: "pointer" }}>
          Delete this section
        </button>
      </div>
    );
  } else if (lineMatch) {
    const [, ti, si, li] = lineMatch.map(Number);
    extraContent = (
      <div>
        <button onClick={() => setDeleteTarget({ type: "line", ti, si, li })}
          style={{ width: "100%", padding: "8px 0", border: "1px solid #fca5a5", borderRadius: 4, background: "#fff", color: "#c0392b", fontSize: 11, cursor: "pointer" }}>
          Delete this line
        </button>
      </div>
    );
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const clone = JSON.parse(JSON.stringify(content)) as LegalPageData;
    if (deleteTarget.type === "section") {
      clone.tabs[deleteTarget.ti].sections.splice(deleteTarget.si, 1);
      setSel(null);
    } else {
      clone.tabs[deleteTarget.ti].sections[deleteTarget.si].lines.splice(deleteTarget.li, 1);
      setSel(null);
    }
    setContent(clone);
    setDeleteTarget(null);
    setStatus(null);
  }

  function getDeleteMessage() {
    if (!deleteTarget) return "";
    if (deleteTarget.type === "section") {
      const t = content.tabs[deleteTarget.ti]?.sections[deleteTarget.si]?.title?.text;
      return `"${t || "This section"}" and all its lines will be permanently removed.`;
    }
    const l = content.tabs[deleteTarget.ti]?.sections[deleteTarget.si]?.lines[deleteTarget.li]?.text;
    return `"${l || "This line"}" will be permanently removed.`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'dm-sans', ui-sans-serif, sans-serif" }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      <ConfirmModal
        open={deleteTarget !== null}
        title={deleteTarget?.type === "section" ? "Delete section?" : "Delete line?"}
        message={getDeleteMessage()}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

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
            <Legal />
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
              ? <PropertiesPanel elKey={sel} content={content} onBlock={onBlock} extraContent={extraContent} previewLang={previewLang} onClose={() => setSel(null)} />
              : selImg
            ? (
              <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Hero Image</div>
                  <button onClick={() => setSelImg(null)} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>&times;</button>
                </div>
                <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
                  <div style={{ background: "#f5f0e8", borderRadius: 6, overflow: "hidden", aspectRatio: "16/7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    {content.heroImage
                      ? <img src={content.heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>Using default image<br />(upload to replace)</span>
                    }
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{ width: "100%", padding: "11px 0", background: uploading ? "#e8e0d5" : "#3B1814", color: uploading ? "#aaa" : "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer" }}>
                    {uploading ? "Uploading…" : "?  Replace image"}
                  </button>
                  {content.heroImage && (
                    <button onClick={() => { setContent((p) => ({ ...p, heroImage: "" })); setStatus(null); }}
                      style={{ marginTop: 10, width: "100%", padding: "8px 0", border: "1px solid #d4c5b5", borderRadius: 6, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
                      ← Revert to default
                    </button>
                  )}
                </div>
              </div>
            )
            : <StructurePanel content={content} activeTab={activeTab} onTabChange={(i) => { setActiveTab(i); setSel(null); }} onSetContent={(c) => { setContent(c); setStatus(null); }} onSetSel={setSel} />
        }
      </div>
    </div>
  );
}
