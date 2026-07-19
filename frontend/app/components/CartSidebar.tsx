"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { optimizeImage } from "@/lib/cloudinary";
// import TabbyPromoWidget from "./TabbyPromoWidget";
// import TamaraPromoWidget from "./TamaraPromoWidget";
import { useLanguage } from "./LanguageContext";
import { getT } from "@/lib/translations";

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CartSidebar() {
  const { items, updateQuantity, removeItem, subtotal, totalCount } = useCart();
  const { isCartOpen, closeCart } = useWishlist();
  const { lang } = useLanguage();
  const t = getT(lang);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ height: "100dvh" }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        style={{ height: "100dvh" }}
        onClick={closeCart}
      />

      {/* Sidebar Panel (Right Side) */}
      <div className="relative flex flex-col bg-white shadow-2xl animate-slide-in-right" style={{ width: 380, maxWidth: "90%", height: "100dvh" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-heading text-xl font-normal" style={{color:"#173946"}}>
            {t.cart.title} ({totalCount})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-2xl p-1 font-body cursor-pointer" style={{color:"#000"}}
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm" style={{color:"#000"}}>{t.cart.empty}</p>
              <button
                onClick={closeCart}
                className="mt-4 rounded-md px-5 py-2.5 text-xs font-medium text-white transition hover:opacity-90 uppercase tracking-widest cursor-pointer"
                style={{backgroundColor:"#173946"}}
              >
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={item.key} className={`flex items-start gap-4 ${idx > 0 ? "pt-6" : ""}`}>
                  {/* Square Image */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={optimizeImage(item.image, 160)} alt={item.name} className="h-full w-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-cream-soft" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-l font-semibold uppercase tracking-wider truncate" style={{color:"#000"}}>
                      {item.name}
                    </p>
                    <p className="text-s mt-0.5" style={{color:"#000"}}>
                      {[item.size, ...item.variants.map((v) => `${v.name}: ${v.value}`)]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                    <p className="mt-1 text-m font-semibold" style={{color:"#000"}}>
                      {item.price.toLocaleString("en-US")} AED
                    </p>

                    {/* Quantity Control & Trash Row */}
                    <div className="flex items-center gap-4 mt-3">
                      {/* Boxed Quantity Selector */}
                      <div className="flex items-center border border-gray-200 px-3 py-1 gap-4">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="font-semibold text-s cursor-pointer" style={{color:"#000"}}
                        >
                          &minus;
                        </button>
                        <span className="text-xs font-medium w-4 text-center" style={{color:"#000"}}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="font-semibold text-xs cursor-pointer" style={{color:"#000"}}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white">
            {/* Tabby & Tamara installment hints — commented out
            <div className="mb-4 flex flex-col gap-2">
              <TabbyPromoWidget price={subtotal} currency="AED" />
              <TamaraPromoWidget price={subtotal} currency="AED" />
            </div>
            */}

            <div className="flex items-center justify-between mb-1">
              <span className="text-m font-semibold" style={{color:"#000"}}>{t.cart.estimatedTotal}</span>
              <span className="text-base font-bold" style={{color:"#000"}}>
                {subtotal.toLocaleString("en-US")} AED
              </span>
            </div>
            <p className="text-3xs mb-5" style={{color:"#000"}}>{t.cart.taxNote}</p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center py-4 text-xs font-semibold text-white transition hover:opacity-90 uppercase tracking-widest text-center"
              style={{backgroundColor:"#173946"}}
            >
              {t.cart.checkout}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
