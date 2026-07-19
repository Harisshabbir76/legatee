"use client";

import { useEffect } from "react";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
        animation: "zfModalFadeIn 0.15s ease",
      }}
    >
      <style>{`
        @keyframes zfModalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes zfModalSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "28px 28px 24px",
          width: 360,
          maxWidth: "calc(100vw - 32px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1)",
          animation: "zfModalSlideUp 0.18s ease",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: danger ? "#fef2f2" : "#fffbeb",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={danger ? "#dc2626" : "#d97706"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {danger
              ? <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>
              : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
            }
          </svg>
        </div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a0a08", marginBottom: 8, fontFamily: "inherit" }}>
          {title}
        </div>

        {/* Message */}
        <div style={{ fontSize: 13, color: "#6f6459", lineHeight: 1.6, marginBottom: 24, fontFamily: "inherit" }}>
          {message}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px 0",
              border: "1px solid #d4c5b5", borderRadius: 7,
              background: "#fff", color: "#3B1814",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#faf7f1")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "10px 0",
              border: "none", borderRadius: 7,
              background: danger ? "#dc2626" : "#3B1814",
              color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
