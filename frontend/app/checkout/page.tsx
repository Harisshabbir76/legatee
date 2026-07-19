"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../components/CartContext";
import { API_URL } from "@/lib/api-client";
import { useUser } from "../components/UserContext";
import { useLanguage } from "../components/LanguageContext";
import { getT } from "@/lib/translations";
import Navbar from "../components/Navbar";
// import TabbyPromoWidget from "../components/TabbyPromoWidget";
// import TamaraPromoWidget from "../components/TamaraPromoWidget";
// import DhlShippingRates from "../components/DhlShippingRates";
// import { TabbyBadge, TamaraBadge } from "../components/PaymentBadges";

interface CustomerForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  emirate: string;
  saveInfo: boolean;
  useShippingAsBilling: boolean;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

const EMPTY_FORM: CustomerForm = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  emirate: "Abu Dhabi",
  saveInfo: false,
  useShippingAsBilling: true,
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"card" | "cod">("cod");

  // Flat shipping price set by the admin (0 = free shipping)
  const [shippingPrice, setShippingPrice] = useState(0);
  useEffect(() => {
    fetch(`${API_URL}/api/shipping`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { price: 0 }))
      .then((d) => setShippingPrice(Number(d.price) || 0))
      .catch(() => {});
  }, []);

  const shippingTotal = items.length > 0 ? shippingPrice : 0;
  const tax = Math.round((subtotal + shippingTotal) * 0.05 * 100) / 100;
  const grandTotal = subtotal + shippingTotal + tax;

  function updateField<K extends keyof CustomerForm>(field: K, value: CustomerForm[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const name = `${form.firstName} ${form.lastName}`.trim();
    const fullAddress = form.apartment ? `${form.address}, ${form.apartment}` : form.address;
    const cityWithEmirate = `${form.city}, ${form.emirate}`;

    try {
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            variants: item.variants,
          })),
          customer: {
            name,
            email: form.email,
            phone: form.phone,
            address: fullAddress,
            city: cityWithEmirate,
          },
          payment: {
            method: selectedPayment === "cod" ? "Cash on Delivery" : "Card",
            status: "pending",
          },
          ...(user?.id ? { userId: user.id } : {}),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Order creation failed.");
      const orderId = orderData.order?._id || orderData.order?.id || orderData._id;

      clear();
      router.push(`/checkout/success?order_id=${orderId}`);
    } catch (err: any) {
      setError(err.message || "Could not complete your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const { lang } = useLanguage();
  const t = getT(lang);
  const inputCls = "w-full border rounded-sm px-3.5 py-3 text-sm outline-none transition text-[16px] sm:text-sm text-black placeholder:text-gray-500";
  const inputStyle = { backgroundColor: "#fff", color: "#000", borderColor: "#000" } as React.CSSProperties;

  return (
    <>
      <Navbar solid />
      <main className="mx-auto max-w-6xl w-full px-4 pt-32 pb-12 sm:px-6 lg:px-10 flex-1">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr] items-start">

          {/* Checkout Form (Left side) */}
          <div className="flex flex-col gap-6">

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Email Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold font-body" style={{color:"#000"}}>{t.checkout.email}</h2>
                  <Link href="/login" className="text-xs font-medium hover:underline" style={{color:"#173946"}}>
                    {t.checkout.signIn}
                  </Link>
                </div>
                <input
                  type="email"
                  required
                  placeholder={t.checkout.enterEmail}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Delivery Section */}
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-semibold font-body" style={{color:"#000"}}>{t.checkout.delivery}</h2>

                <div className="flex flex-col gap-3">
                  {/* Country Selector (Only UAE) */}
                  <select
                    disabled
                    value="United Arab Emirates"
                    className="w-full border rounded-sm px-3.5 py-3 text-sm cursor-not-allowed"
                    style={{ backgroundColor: "#f3f4f6", color: "#6b7280", borderColor: "#000" }}
                  >
                    <option>United Arab Emirates</option>
                  </select>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={t.checkout.firstName}
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      required
                      placeholder={t.checkout.lastName}
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>

                  {/* Phone */}
                  <input
                    type="tel"
                    required
                    placeholder={t.checkout.phone}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />

                  {/* Address */}
                  <input
                    type="text"
                    required
                    placeholder={t.checkout.address}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />

                  {/* Apartment */}
                  <input
                    type="text"
                    placeholder={t.checkout.apartment}
                    value={form.apartment}
                    onChange={(e) => updateField("apartment", e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />

                  {/* City & Emirate */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={t.checkout.city}
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                    <select
                      value={form.emirate}
                      onChange={(e) => updateField("emirate", e.target.value)}
                      className="border rounded-sm px-3.5 py-3 text-sm outline-none transition text-black"
                      style={{ backgroundColor: "#fff", borderColor: "#000" }}
                    >
                      <option value="Abu Dhabi">{t.checkout.emirates.abuDhabi}</option>
                      <option value="Dubai">{t.checkout.emirates.dubai}</option>
                      <option value="Sharjah">{t.checkout.emirates.sharjah}</option>
                      <option value="Ajman">{t.checkout.emirates.ajman}</option>
                      <option value="Umm Al Quwain">{t.checkout.emirates.ummAlQuwain}</option>
                      <option value="Ras Al Khaimah">{t.checkout.emirates.rasAlKhaimah}</option>
                      <option value="Fujairah">{t.checkout.emirates.fujairah}</option>
                    </select>
                  </div>
                </div>

                {/* Save Info Checkbox */}
                <label className="flex items-center gap-2 mt-2 text-xs cursor-pointer select-none" style={{color:"#000"}}>
                  <input
                    type="checkbox"
                    checked={form.saveInfo}
                    onChange={(e) => updateField("saveInfo", e.target.checked)}
                    className="h-4 w-4 border-gray-300 cursor-pointer"
                  />
                  <span>{t.checkout.saveInfo}</span>
                </label>

                {/* <DhlShippingRates city={form.city} weight={Math.max(0.1, items.reduce((sum, item) => sum + (item.quantity * 0.3), 0))} /> */}
              </div>

              {/* Payment Section */}
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-base font-semibold font-body" style={{color:"#000"}}>{t.checkout.payment}</h2>
                  <p className="text-2xs" style={{color:"#000"}}>{t.checkout.secureNote}</p>
                </div>

                {/* Cash on Delivery */}
                <div
                  className={`border rounded-sm cursor-pointer transition ${selectedPayment === "cod" ? "border-black" : "border-gray-300 hover:border-black"}`}
                  onClick={() => setSelectedPayment("cod")}
                >
                  <div className="flex items-center gap-3 p-3.5">
                    <input
                      type="radio"
                      name="payment-method"
                      value="cod"
                      checked={selectedPayment === "cod"}
                      onChange={() => setSelectedPayment("cod")}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-xs font-semibold" style={{color:"#000"}}>Cash on Delivery</p>
                      <p className="text-3xs" style={{color:"#000"}}>Pay in cash when your order arrives</p>
                    </div>
                    <span className="ml-auto text-lg">💵</span>
                  </div>
                </div>

                {/* Card Payment */}
                <div
                  className={`border rounded-sm cursor-pointer transition ${selectedPayment === "card" ? "border-black" : "border-gray-300 hover:border-black"}`}
                  onClick={() => setSelectedPayment("card")}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3.5 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment-method"
                        value="card"
                        checked={selectedPayment === "card"}
                        onChange={() => setSelectedPayment("card")}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs font-semibold" style={{color:"#000"}}>{t.checkout.creditCard}</span>
                    </div>
                    <div className="flex gap-1.5 opacity-90">
                      <svg width="34" height="22" viewBox="0 0 24 15" fill="none" className="border border-gray-200 rounded bg-white px-1">
                        <rect width="24" height="15" rx="1" fill="#FFF"/>
                        <path d="M8.2 11l.9-5.1H11L10.1 11H8.2zm6.2-4.9c-.3-.1-.7-.2-1.2-.2-1.3 0-2.2.7-2.2 1.6 0 .7.7 1.1 1.2 1.4.5.2.7.4.7.6-.1.3-.4.5-.8.5-.5 0-.8-.1-1.2-.3l-.2-.1-.2 1.2c.3.1.8.3 1.3.3 1.4 0 2.3-.7 2.3-1.8 0-.8-.5-1.2-1.5-1.7-.5-.2-.7-.4-.7-.6 0-.2.3-.4.8-.4.4 0 .7.1 1 .2l.1.1.2-1.1zm3.8 4.9l1-3.2c.1-.3.2-.6.5-1l.6 1.2.4 2H18.2zm-9.3-5.1L6.9 11H5.6L4.3 7.5c-.3-.8-.7-1.1-1.3-1.3v-.3H6l.3 1.8.4-1.8H9v.2z" fill="#1A1F71"/>
                      </svg>
                      <svg width="34" height="22" viewBox="0 0 24 15" fill="none" className="border border-gray-200 rounded bg-white px-1">
                        <rect width="24" height="15" rx="1" fill="#FFF"/>
                        <circle cx="9.5" cy="7.5" r="4.5" fill="#EB001B" />
                        <circle cx="14.5" cy="7.5" r="4.5" fill="#F79E1B" fillOpacity="0.85" />
                      </svg>
                    </div>
                  </div>

                  {/* Card inputs — shown only when card is selected */}
                  {selectedPayment === "card" && (
                    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <div className="relative border-b border-gray-200">
                        <input
                          type="text"
                          placeholder={t.checkout.cardNumber}
                          value={form.cardNumber}
                          onChange={(e) => updateField("cardNumber", e.target.value)}
                          className="w-full px-3.5 py-3 text-[16px] sm:text-sm outline-none text-black bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder={t.checkout.expiry}
                          value={form.cardExpiry}
                          onChange={(e) => updateField("cardExpiry", e.target.value)}
                          className="w-full px-3.5 py-3 border-r border-gray-200 text-[16px] sm:text-sm outline-none text-black bg-white"
                        />
                        <input
                          type="text"
                          placeholder={t.checkout.securityCode}
                          value={form.cardCvc}
                          onChange={(e) => updateField("cardCvc", e.target.value)}
                          className="w-full px-3.5 py-3 text-[16px] sm:text-sm outline-none text-black bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder={t.checkout.nameOnCard}
                        value={form.cardName}
                        onChange={(e) => updateField("cardName", e.target.value)}
                        className="w-full px-3.5 py-3 text-[16px] sm:text-sm outline-none text-black bg-white"
                      />
                      <p className="px-3.5 pb-3 text-3xs text-gray-400">Card payment integration coming soon. Use Cash on Delivery for now.</p>
                    </div>
                  )}
                </div>

                {/* Tabby / Tamara options (commented out — to re-enable uncomment below) */}
                {/*
                <div className={`border rounded-sm cursor-pointer transition ${selectedPayment === "tabby" ? "border-black" : "border-gray-300 hover:border-black"}`} onClick={() => setSelectedPayment("tabby")}>
                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment-method" value="tabby" checked={selectedPayment === "tabby"} onChange={() => setSelectedPayment("tabby")} onClick={(e) => e.stopPropagation()} />
                      <div>
                        <p className="text-xs font-semibold" style={{color:"#000"}}>{t.checkout.tabbyTitle}</p>
                        <p className="text-3xs" style={{color:"#000"}}>{t.checkout.tabbySubtitle}</p>
                      </div>
                    </div>
                    <TabbyBadge />
                  </div>
                  {selectedPayment === "tabby" && subtotal > 0 && (
                    <div className="px-3.5 pb-3.5" onClick={(e) => e.stopPropagation()}>
                      <TabbyPromoWidget price={subtotal} currency="AED" />
                    </div>
                  )}
                </div>
                <div className={`border rounded-sm cursor-pointer transition ${selectedPayment === "tamara" ? "border-black" : "border-gray-300 hover:border-black"}`} onClick={() => setSelectedPayment("tamara")}>
                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment-method" value="tamara" checked={selectedPayment === "tamara"} onChange={() => setSelectedPayment("tamara")} onClick={(e) => e.stopPropagation()} />
                      <div>
                        <p className="text-xs font-semibold" style={{color:"#000"}}>{t.checkout.tamaraTitle}</p>
                        <p className="text-3xs" style={{color:"#000"}}>{t.checkout.tamaraSubtitle}</p>
                      </div>
                    </div>
                    <TamaraBadge />
                  </div>
                  {subtotal > 0 && (
                    <div className="px-3.5 pb-3.5" onClick={(e) => e.stopPropagation()}>
                      <TamaraPromoWidget price={subtotal} currency="AED" type="installment-plan" />
                    </div>
                  )}
                </div>
                */}
              </div>

              {error && (
                <p className="rounded-sm bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-xs font-semibold text-white tracking-widest uppercase hover:opacity-95 transition disabled:opacity-65 cursor-pointer mt-4"
                style={{backgroundColor:"#173946"}}
              >
                {submitting ? t.checkout.placingOrder : items.length === 0 ? t.checkout.addItems : t.checkout.payNow}
              </button>
            </form>
          </div>

          {/* Order Summary (Right side) */}
          <div className="h-fit rounded-sm border border-gray-200 bg-gray-50 p-5 sm:p-6 lg:sticky lg:top-32">
            {items.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm font-semibold" style={{color:"#000"}}>{t.checkout.emptyBag}</p>
                <div className="flex items-center justify-between border-t border-gray-200 mt-6 pt-4 text-xs font-semibold" style={{color:"#000"}}>
                  <span>{t.checkout.subtotal}</span>
                  <span>AED 0.00</span>
                </div>
                <div className="flex items-center justify-between mt-4 text-base font-bold" style={{color:"#000"}}>
                  <span>{t.checkout.total}</span>
                  <span>AED 0.00</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <div key={item.key} className={`flex gap-4 items-center ${idx > 0 ? "pt-4" : ""}`}>
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider truncate" style={{color:"#000"}}>{item.name}</p>
                        <p className="text-3xs mt-0.5" style={{color:"#000"}}>
                          {[item.size, ...item.variants.map((v) => `${v.name}: ${v.value}`)]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                        <p className="text-3xs mt-0.5" style={{color:"#000"}}>{t.profile.qty}: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold" style={{color:"#000"}}>
                        {(item.price * item.quantity).toLocaleString("en-US")} AED
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6 flex flex-col gap-3">
                  <div className="flex justify-between text-xs font-medium" style={{color:"#000"}}>
                    <span>{t.checkout.subtotal}</span>
                    <span>{subtotal.toLocaleString("en-US")} AED</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium" style={{color:"#000"}}>
                    <span>{t.checkout.shipping}</span>
                    {shippingTotal > 0 ? (
                      <span>{shippingTotal.toLocaleString("en-US")} AED</span>
                    ) : (
                      <span className="text-3xs uppercase tracking-widest" style={{color:"#000"}}>{t.checkout.free}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs font-medium" style={{color:"#000"}}>
                    <span>{t.checkout.tax}</span>
                    <span>{tax.toLocaleString("en-US", { minimumFractionDigits: 2 })} AED</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 mt-2 pt-4 text-lg font-bold" style={{color:"#000"}}>
                    <span>{t.checkout.total}</span>
                    <span>
                      <span className="text-3xs font-normal mr-1" style={{color:"#000"}}>AED</span>
                      {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
