"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../components/CartContext";
import { useLanguage } from "../../components/LanguageContext";
import { getT } from "@/lib/translations";
import { API_URL } from "@/lib/api-client";
import Navbar from "../../components/Navbar";

interface OrderItem {
  name: string;
  size?: string;
  variants?: { name: string; value: string }[];
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customer: { name: string; email: string; phone: string; address: string; city: string };
  items: OrderItem[];
  total: number;
  tax: number;
  shipping: number;
  payment?: { method: string; status: string };
  status: string;
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const { clear } = useCart();
  const { lang } = useLanguage();
  const t = getT(lang);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    fetch(`${API_URL}/api/orders/${orderId}`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.order) setOrder(d.order); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const subtotal = order ? order.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;

  return (
    <>
      <Navbar solid />
      <main style={{ minHeight: "100vh", background: "#faf8f5", paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

          {/* Success header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#173946", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontSize: "clamp(22px, 5vw, 32px)", letterSpacing: "0.08em", color: "#173946", margin: "0 0 10px" }}>
              {t.checkoutSuccess.title}
            </h1>
            <p style={{ color: "#555", fontSize: 15, maxWidth: 400, lineHeight: 1.6, margin: "0 auto" }}>
              {t.checkoutSuccess.message}
            </p>
            {order && (
              <p style={{ marginTop: 10, fontSize: 13, color: "#888" }}>
                Order #{String(order._id).slice(-8).toUpperCase()}
              </p>
            )}
          </div>

          {loading && (
            <p style={{ textAlign: "center", color: "#999", fontSize: 14 }}>Loading order details…</p>
          )}

          {order && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Customer Info */}
              <div style={{ background: "#fff", border: "1px solid #e8e0d5", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#173946", padding: "12px 20px" }}>
                  <h2 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Customer Information</h2>
                </div>
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", fontSize: 14 }}>
                  <div>
                    <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</span>
                    <p style={{ margin: "2px 0 0", color: "#222", fontWeight: 500 }}>{order.customer.name}</p>
                  </div>
                  <div>
                    <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</span>
                    <p style={{ margin: "2px 0 0", color: "#222", fontWeight: 500 }}>{order.customer.email}</p>
                  </div>
                  <div>
                    <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</span>
                    <p style={{ margin: "2px 0 0", color: "#222", fontWeight: 500 }}>{order.customer.phone}</p>
                  </div>
                  <div>
                    <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>City</span>
                    <p style={{ margin: "2px 0 0", color: "#222", fontWeight: 500 }}>{order.customer.city}</p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Delivery Address</span>
                    <p style={{ margin: "2px 0 0", color: "#222", fontWeight: 500 }}>{order.customer.address}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div style={{ background: "#fff", border: "1px solid #e8e0d5", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#173946", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Order Summary</h2>
                  {order.payment?.method && (
                    <span style={{ color: "#a8c4c8", fontSize: 12 }}>{order.payment.method}</span>
                  )}
                </div>

                {/* Items */}
                <div style={{ padding: "0 20px" }}>
                  {order.items.map((item, i) => {
                    const meta = [item.size, ...(item.variants ?? []).map((v) => `${v.name}: ${v.value}`)].filter(Boolean).join(" / ");
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 0", borderBottom: i < order.items.length - 1 ? "1px solid #f0ebe3" : "none" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#222" }}>{item.name}</p>
                          {meta && <p style={{ margin: "3px 0 0", fontSize: 12, color: "#888" }}>{meta}</p>}
                          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#888" }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#222", whiteSpace: "nowrap", marginLeft: 16 }}>
                          AED {(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div style={{ padding: "14px 20px", borderTop: "1px solid #e8e0d5", background: "#faf8f5", fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#555" }}>
                    <span>Subtotal</span>
                    <span>AED {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#555" }}>
                    <span>Shipping</span>
                    <span>{order.shipping > 0 ? `AED ${order.shipping.toFixed(2)}` : "Free"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, color: "#555" }}>
                    <span>Tax (5%)</span>
                    <span>AED {order.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#173946", paddingTop: 10, borderTop: "1px solid #e8e0d5" }}>
                    <span>Total</span>
                    <span>AED {order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link
              href="/shop"
              style={{ display: "inline-block", padding: "14px 40px", background: "#173946", color: "#fff", letterSpacing: "0.15em", fontSize: 13, textDecoration: "none", textTransform: "uppercase" }}
            >
              {t.checkoutSuccess.continueShopping}
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
