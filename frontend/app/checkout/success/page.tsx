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
  const paymentIntentId = searchParams.get("payment_intent_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // COD / Card flow — clear cart immediately, fetch order once
  useEffect(() => {
    if (!orderId) return;
    clear();
    fetch(`${API_URL}/api/orders/${orderId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.order) setOrder(d.order); })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Ziina flow — poll until payment confirmed (up to 12 attempts × 2.5 s)
  useEffect(() => {
    if (!paymentIntentId) {
      if (!orderId) setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    const poll = async () => {
      try {
        attempts++;
        const res = await fetch(`${API_URL}/api/ziina/order-by-intent/${paymentIntentId}`);
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.success && data.order) {
          setOrder(data.order);
          clear();
          setLoading(false);
          return;
        }

        if (res.status === 202 && attempts < maxAttempts) {
          window.setTimeout(poll, 2500);
          return;
        }

        if (res.status === 402) {
          setError(data.message || "Payment was not successful.");
        } else if (attempts >= maxAttempts) {
          setError(
            "Payment verification is taking longer than expected. If your payment was completed, your order will appear once confirmed."
          );
        } else {
          setError(data.message || "Could not verify your payment.");
        }
      } catch {
        if (cancelled) return;
        if (attempts < maxAttempts) {
          window.setTimeout(poll, 2500);
          return;
        }
        setError("A connection issue occurred while verifying your order.");
      }
      setLoading(false);
    };

    poll();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntentId]);

  const subtotal = order ? order.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;

  return (
    <>
      <Navbar solid />
      <main style={{ minHeight: "100vh", background: "#faf8f5", paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

          {/* Loading — used for both initial fetch and Ziina polling */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "2px solid rgba(23,57,70,0.1)", borderTopColor: "#173946",
                animation: "spin 0.8s linear infinite", margin: "0 auto 24px",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <h2 style={{ fontFamily: "var(--font-serif,Georgia,serif)", fontSize: 22, letterSpacing: "0.06em", color: "#173946", margin: "0 0 8px" }}>
                {paymentIntentId ? "VERIFYING YOUR PAYMENT" : "LOADING ORDER…"}
              </h2>
              {paymentIntentId && (
                <p style={{ color: "#777", fontSize: 14 }}>Confirming payment before we notify our team…</p>
              )}
            </div>
          )}

          {/* Error state (mainly Ziina payment failure) */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1 style={{ fontFamily: "var(--font-serif,Georgia,serif)", fontSize: "clamp(20px,5vw,28px)", color: "#173946", margin: "0 0 12px" }}>
                Payment Not Confirmed
              </h1>
              <p style={{ color: "#555", fontSize: 14, maxWidth: 440, lineHeight: 1.6, margin: "0 auto 28px" }}>{error}</p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/checkout" style={{ display: "inline-block", padding: "13px 32px", background: "#173946", color: "#fff", letterSpacing: "0.12em", fontSize: 12, textDecoration: "none", textTransform: "uppercase" }}>
                  Try Again
                </Link>
                <Link href="/shop" style={{ display: "inline-block", padding: "13px 32px", border: "1px solid #173946", color: "#173946", letterSpacing: "0.12em", fontSize: 12, textDecoration: "none", textTransform: "uppercase" }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

          {/* Success state */}
          {!loading && !error && (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#173946", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 style={{ fontFamily: "var(--font-serif,Georgia,serif)", fontSize: "clamp(22px,5vw,32px)", letterSpacing: "0.08em", color: "#173946", margin: "0 0 10px" }}>
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

              <div style={{ textAlign: "center", marginTop: 36 }}>
                <Link
                  href="/shop"
                  style={{ display: "inline-block", padding: "14px 40px", background: "#173946", color: "#fff", letterSpacing: "0.15em", fontSize: 13, textDecoration: "none", textTransform: "uppercase" }}
                >
                  {t.checkoutSuccess.continueShopping}
                </Link>
              </div>
            </>
          )}

        </div>
      </main>
    </>
  );
}
