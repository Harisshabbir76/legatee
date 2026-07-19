"use client";

import Link from "next/link";
import { useLanguage } from "../../components/LanguageContext";
import { getT } from "@/lib/translations";
import Navbar from "../../components/Navbar";

export default function CheckoutCancelPage() {
  const { lang } = useLanguage();
  const t = getT(lang);

  return (
    <>
      <Navbar solid />
      <main style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 48px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#173946", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontSize: "clamp(22px, 5vw, 32px)", letterSpacing: "0.08em", color: "#173946", margin: "0 0 12px" }}>
        {t.checkoutCancel.title}
      </h1>
      <p style={{ color: "#000", fontSize: 15, maxWidth: 420, lineHeight: 1.6, margin: "0 0 32px" }}>
        {t.checkoutCancel.message}
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/checkout"
          style={{ display: "inline-block", padding: "14px 36px", background: "#173946", color: "#fff", letterSpacing: "0.15em", fontSize: 13, textDecoration: "none" }}
        >
          {t.checkoutCancel.returnCheckout}
        </Link>
        <Link
          href="/shop"
          style={{ display: "inline-block", padding: "14px 36px", border: "1px solid #173946", color: "#173946", letterSpacing: "0.15em", fontSize: 13, textDecoration: "none" }}
        >
          {t.checkoutCancel.continueShopping}
        </Link>
      </div>
    </main>
    </>
  );
}
