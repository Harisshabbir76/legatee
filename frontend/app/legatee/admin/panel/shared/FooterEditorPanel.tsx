"use client";

import React from "react";
import type { FooterData, ContentBlock } from "@/lib/api";
import { getArDefault } from "@/lib/ar-content-defaults";

type StyleRecord = Record<string, string>;
type StyleKey = keyof NonNullable<ContentBlock["style"]>;

// ── Form helpers (same style as the per-page editors) ────────────────────────

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

// ── Key → label / section ────────────────────────────────────────────────────

const FOOTER_LABELS: Record<string, string> = {
  "footer.quote":          "Quote Text",
  "footer.signatureTitle": "Signature Title",
  "footer.signatureCopy":  "Signature Copy",
  "footer.buttonText":     "Button Text",
  "footer.buttonLink":     "Button URL",
};
const FOOTER_LINK_KEYS = new Set(["footer.buttonLink"]);
const FOOTER_BUTTON_LINK_MAP: Record<string, string> = {
  "footer.buttonText": "footer.buttonLink",
};

function getFooterLabel(key: string) {
  return FOOTER_LABELS[key] ?? key;
}

// ── State helpers ────────────────────────────────────────────────────────────

function getBlock(content: FooterData, key: string): ContentBlock | null {
  const localKey = key.replace(/^footer\./, "") as keyof FooterData;
  const val = content[localKey];
  if (val && typeof val === "object" && "text" in val) return val as ContentBlock;
  return null;
}

function getLinkVal(content: FooterData, key: string): string {
  const localKey = key.replace(/^footer\./, "") as keyof FooterData;
  const val = content[localKey];
  return typeof val === "string" ? val : "";
}

// ── Image panel ──────────────────────────────────────────────────────────────

export function FooterImagePanel({
  imageUrl,
  uploading,
  onUpload,
  onRevert,
  onClose,
}: {
  imageUrl: string;
  uploading: boolean;
  onUpload: () => void;
  onRevert: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ width: 290, flexShrink: 0, borderLeft: "1px solid #cdbfae", background: "#fff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#3B1814", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>Footer</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>Footer Image</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#6f6459", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Current Image</div>
        <div style={{ background: "#f5f0e8", borderRadius: 6, overflow: "hidden", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          {imageUrl ? (
            <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 11, color: "#aaa", textAlign: "center", padding: "0 16px" }}>Using default image<br />(upload to replace)</span>
          )}
        </div>
        <button onClick={onUpload} disabled={uploading}
          style={{ width: "100%", padding: "12px 0", background: uploading ? "#e8e0d5" : "#3B1814", color: uploading ? "#aaa" : "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {uploading ? "Uploading…" : "↑  Replace image"}
        </button>
        <div style={{ marginTop: 8, fontSize: 10, color: "#aaa", textAlign: "center" }}>Supports JPG, PNG, WebP · Max 10 MB</div>
        {imageUrl && (
          <button onClick={onRevert}
            style={{ marginTop: 12, width: "100%", padding: "8px 0", border: "1px solid #d4c5b5", borderRadius: 6, background: "#fff", color: "#6f6459", fontSize: 11, cursor: "pointer" }}>
            ↩ Revert to default image
          </button>
        )}
        <div style={{ marginTop: 20, padding: 12, background: "#faf7f1", borderRadius: 6, fontSize: 11, color: "#6f6459", lineHeight: 1.7 }}>
          <strong style={{ color: "#3B1814" }}>Tip:</strong> After uploading, click <strong>Save Changes</strong> to publish.
        </div>
      </div>
    </div>
  );
}

// ── Text panel ───────────────────────────────────────────────────────────────

export function FooterTextPanel({
  elKey,
  footerContent,
  onBlock,
  onLink,
  previewLang,
  onClose,
}: {
  elKey: string;
  footerContent: FooterData;
  onBlock: (localKey: keyof FooterData, block: ContentBlock) => void;
  onLink:  (localKey: keyof FooterData, val: string) => void;
  previewLang?: "en" | "ar";
  onClose: () => void;
}) {
  const [panelLang, setPanelLang] = React.useState<"en" | "ar">(previewLang ?? "en");
  React.useEffect(() => { if (previewLang) setPanelLang(previewLang); }, [previewLang]);
  const isLink    = FOOTER_LINK_KEYS.has(elKey);
  const linkedKey = FOOTER_BUTTON_LINK_MAP[elKey] ?? null;
  const block     = isLink ? null : getBlock(footerContent, elKey);
  const style     = (panelLang === "ar" ? (block?.styleAr ?? {}) : (block?.style ?? {})) as StyleRecord;
  const localKey  = elKey.replace(/^footer\./, "") as keyof FooterData;
  const editorRef = React.useRef<HTMLDivElement>(null);

  function us(k: StyleKey, v: string) {
    if (!block) return;
    if (panelLang === "ar") {
      onBlock(localKey, { ...block, styleAr: { ...(block.styleAr ?? {}), [k]: v || undefined } as Record<string, string> });
    } else {
      onBlock(localKey, { ...block, style: { ...(block.style ?? {}), [k]: v || undefined } as Record<string, string> });
    }
  }

  const currentEditorVal = block
    ? (panelLang === "ar" ? (block.textAr ?? getArDefault("homepage", `footer.${localKey}`)) : block.text)
    : "";

  React.useEffect(() => {
    const div = editorRef.current;
    if (!div || document.activeElement === div) return;
    if (div.innerHTML !== currentEditorVal) div.innerHTML = currentEditorVal;
  }, [currentEditorVal]);

  function handleEditorInput() {
    const div = editorRef.current;
    if (!div || !block) return;
    if (panelLang === "ar") onBlock(localKey, { ...block, textAr: div.innerHTML });
    else onBlock(localKey, { ...block, text: div.innerHTML });
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
          <div style={{ fontSize: 9, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.07em" }}>Footer</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{getFooterLabel(elKey)}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#b89080", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, paddingBottom: 24 }}>
        {isLink ? (
          <div style={{ padding: 16 }}>
            <PF label="URL"><PI value={getLinkVal(footerContent, elKey)} onChange={(v) => onLink(localKey, v)} placeholder="/shop or https://..." /></PF>
          </div>
        ) : block ? (
          <>
            <Divider title="Content" />
            <div style={{ padding: "0 16px" }}>
              {linkedKey && (
                <PF label="Redirect URL">
                  <PI value={getLinkVal(footerContent, linkedKey)} onChange={(v) => onLink(linkedKey.replace(/^footer\./, "") as keyof FooterData, v)} placeholder="/shop or https://..." />
                </PF>
              )}
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {(["en", "ar"] as const).map((l) => (
                  <button key={l} onClick={() => setPanelLang(l)}
                    style={{ flex: 1, padding: "5px 0", border: `1px solid ${panelLang === l ? "#3B1814" : "#d4c5b5"}`, borderRadius: 4, background: panelLang === l ? "#3B1814" : "#fff", color: panelLang === l ? "#fff" : "#6f6459", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>
                    {l === "en" ? "EN" : "AR عربي"}
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
              <PF label="HTML Tag"><PS value={block.tag ?? "p"} onChange={(v) => onBlock(localKey, { ...block, tag: v })} options={TAG_OPTS} /></PF>
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
              <button onClick={() => onBlock(localKey, panelLang === "ar" ? { ...block!, styleAr: {} } : { ...block!, style: {} })}
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
