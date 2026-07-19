"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "../components/UserContext";
import type { UserOrder } from "@/lib/api";
import { useCart } from "../components/CartContext";
import { API_URL } from "@/lib/api-client";
import { userAuthHeader } from "@/lib/token";
import { useLanguage } from "../components/LanguageContext";
import { getT } from "@/lib/translations";

type Tab = "profile" | "orders";

const STATUS_COLORS: Record<string, string> = {
  pending:            "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed:          "bg-blue-50 text-blue-700 border border-blue-200",
  "out for delivery": "bg-orange-50 text-orange-700 border border-orange-200",
  delivered:          "bg-green-50 text-green-700 border border-green-200",
  cancelled:          "bg-red-50 text-red-700 border border-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh, logout, logoutAll } = useUser();
  const { addItem } = useCart();
  const [tab, setTab] = useState<Tab>("profile");

  const { lang } = useLanguage();
  const t = getT(lang);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setEmailMarketing(user.emailMarketing || false);
    }
  }, [user]);

  useEffect(() => {
    if (tab === "orders") {
      setOrdersLoading(true);
      fetch(`${API_URL}/api/user/orders`, { headers: userAuthHeader() })
        .then((r) => r.json())
        .then((d) => setOrders(d.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...userAuthHeader() },
        body: JSON.stringify({ name, phone, address, city }),
      });
      if (!res.ok) throw new Error("Failed to save.");
      await refresh();
      setSaveMsg(t.profile.savedSuccess);
    } catch {
      setSaveMsg(t.profile.savedError);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleMarketing(checked: boolean) {
    setEmailMarketing(checked);
    await fetch(`${API_URL}/api/user/email-marketing`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...userAuthHeader() },
      body: JSON.stringify({ enabled: checked }),
    });
    await refresh();
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  async function handleLogoutAll() {
    await logoutAll();
    router.push("/");
  }

  function handleBuyAgain(order: UserOrder) {
    order.items.forEach((item) => {
      addItem({
        productId: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        variants: item.variants,
        image: undefined,
      });
    });
    router.push("/checkout");
  }

  const inputCls = "border rounded-sm px-3.5 py-3 text-sm outline-none transition text-[16px] sm:text-sm text-black";
  const inputStyle = { backgroundColor: "#fff", color: "#000", borderColor: "#000" } as React.CSSProperties;

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-32">
        <p className="text-sm" style={{color:"#000"}}>{t.profile.loading}</p>
      </main>
    );
  }

  if (!user) return null;

  const navBtn = (tabKey: Tab, label: string) => (
    <button
      onClick={() => setTab(tabKey)}
      className="px-4 py-2 text-sm rounded-sm transition font-medium cursor-pointer"
      style={tab === tabKey ? { backgroundColor: "rgba(23,57,70,0.1)", color: "#173946" } : { color: "#000" }}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-32 pb-12 flex-1">

      {/* Mobile: user info + horizontal tab bar */}
      <div className="lg:hidden mb-6">
        <p className="text-xs uppercase tracking-widest mb-0.5" style={{color:"#000"}}>{t.profile.account}</p>
        <p className="text-sm font-semibold truncate" style={{color:"#000"}}>{user.name || user.email}</p>
        <p className="text-xs truncate mb-4" style={{color:"#000"}}>{user.email}</p>
        <div className="flex gap-2 border-b border-line pb-0 overflow-x-auto">
          {navBtn("profile", t.profile.profile)}
          {navBtn("orders", t.profile.orders)}
        </div>
      </div>

      <div className="flex gap-8 items-start">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-48 flex-shrink-0 flex-col sticky top-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest mb-1" style={{color:"#000"}}>{t.profile.account}</p>
            <p className="text-sm font-semibold truncate" style={{color:"#000"}}>{user.name || user.email}</p>
            <p className="text-xs truncate" style={{color:"#000"}}>{user.email}</p>
          </div>
          <nav className="flex flex-col gap-1">
            {navBtn("profile", t.profile.profile)}
            {navBtn("orders", t.profile.orders)}
          </nav>
          <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6">
            <button
              onClick={handleLogout}
              className="text-left px-3 py-2 rounded-sm text-sm transition hover:bg-gray-50 cursor-pointer"
              style={{color:"#000"}}
            >
              {t.profile.signOut}
            </button>
            <button
              onClick={handleLogoutAll}
              className="text-left px-3 py-2 rounded-sm text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              {t.profile.signOutAll}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <div className="flex flex-col gap-6 sm:gap-8">
              <h1 className="font-heading text-xl sm:text-2xl uppercase tracking-widest" style={{color:"#173946"}}>{t.profile.myProfile}</h1>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 sm:gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#000"}}>{t.profile.fullName}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.profile.namePlaceholder}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#000"}}>{t.profile.email}</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="border rounded-sm px-3.5 py-3 text-sm cursor-not-allowed"
                      style={{ backgroundColor: "#f3f4f6", color: "#6b7280", borderColor: "#000" }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#000"}}>{t.profile.phone}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.profile.phonePlaceholder}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#000"}}>{t.profile.city}</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t.profile.cityPlaceholder}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#000"}}>{t.profile.address}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t.profile.addressPlaceholder}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {saveMsg && (
                  <p className={`text-sm rounded-sm px-4 py-2.5 ${saveMsg === t.profile.savedSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {saveMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="self-start px-6 py-2.5 text-xs font-semibold text-white tracking-widest uppercase hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
                  style={{backgroundColor:"#173946"}}
                >
                  {saving ? t.profile.saving : t.profile.saveChanges}
                </button>
              </form>

              {/* Email Marketing */}
              <div className="border-t border-line pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{color:"#000"}}>{t.profile.emailMarketing}</h2>
                <p className="text-xs mb-4" style={{color:"#000"}}>
                  {t.profile.emailMarketingDesc}
                </p>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => handleToggleMarketing(!emailMarketing)}
                    className="relative w-10 h-6 rounded-full transition-colors"
                    style={{backgroundColor: emailMarketing ? "#173946" : "#d1d5db"}}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailMarketing ? "translate-x-4" : ""}`}
                    />
                  </div>
                  <span className="text-sm" style={{color:"#000"}}>
                    {emailMarketing ? t.profile.subscribed : t.profile.notSubscribed}
                  </span>
                </label>
              </div>

              {/* Mobile logout buttons */}
              <div className="lg:hidden border-t border-line pt-6 flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 rounded-sm text-sm transition hover:bg-gray-50 cursor-pointer"
                  style={{color:"#000"}}
                >
                  {t.profile.signOut}
                </button>
                <button
                  onClick={handleLogoutAll}
                  className="text-left px-3 py-2 rounded-sm text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  {t.profile.signOutAll}
                </button>
              </div>
            </div>
          )}

          {/* ── Orders tab ── */}
          {tab === "orders" && (
            <div className="flex flex-col gap-5 sm:gap-6">
              <h1 className="font-heading text-xl sm:text-2xl uppercase tracking-widest" style={{color:"#173946"}}>{t.profile.myOrders}</h1>

              {ordersLoading ? (
                <p className="text-sm" style={{color:"#000"}}>{t.profile.loadingOrders}</p>
              ) : orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line p-10 sm:p-12 text-center">
                  <p className="text-sm" style={{color:"#000"}}>{t.profile.noOrders}</p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest underline"
                    style={{color:"#173946"}}
                  >
                    {t.profile.startShopping}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <div key={order.id || order._id} className="rounded-lg border border-line bg-white overflow-hidden">
                      {/* Order header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 sm:px-5 py-3 bg-gray-50">
                        <div>
                          <p className="text-xs" style={{color:"#000"}}>{t.profile.orderPlaced}</p>
                          <p className="text-sm font-semibold" style={{color:"#000"}}>{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{color:"#000"}}>{t.profile.total}</p>
                          <p className="text-sm font-semibold" style={{color:"#000"}}>{order.total.toLocaleString("en-US")} AED</p>
                        </div>
                        <div>
                          <p className="text-xs mb-1" style={{color:"#000"}}>{t.profile.status}</p>
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="px-4 sm:px-5 py-4 flex flex-col gap-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-start gap-3 sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium" style={{color:"#000"}}>{item.name}</p>
                              <p className="text-xs mt-0.5" style={{color:"#000"}}>
                                {[item.size, ...item.variants.map((v) => `${v.name}: ${v.value}`)]
                                  .filter(Boolean)
                                  .join(" / ")}
                              </p>
                              <p className="text-xs" style={{color:"#000"}}>{t.profile.qty}: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold whitespace-nowrap" style={{color:"#000"}}>
                              {(item.price * item.quantity).toLocaleString("en-US")} AED
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Buy again */}
                      <div className="border-t border-line px-4 sm:px-5 py-3 flex justify-end">
                        <button
                          onClick={() => handleBuyAgain(order)}
                          className="text-xs font-semibold uppercase tracking-widest text-white px-4 py-2 hover:opacity-90 transition"
                          style={{backgroundColor:"#173946"}}
                        >
                          {t.profile.buyAgain}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
