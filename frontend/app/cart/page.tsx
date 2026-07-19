"use client";

import Link from "next/link";
import { useCart } from "../components/CartContext";
import TabbyPromoWidget from "../components/TabbyPromoWidget";
import TamaraPromoWidget from "../components/TamaraPromoWidget";
import { useLanguage } from "../components/LanguageContext";
import { getT } from "@/lib/translations";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { lang } = useLanguage();
  const t = getT(lang);

  return (
    <main className="mx-auto max-w-4xl px-6 pb-12 pt-32 sm:px-10">
        <h1 className="font-heading text-3xl text-center" style={{color:"#173946"}}>{t.cart.pageTitle}</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-line p-10 text-center">
            <p className="text-sm" style={{color:"#000"}}>{t.cart.empty}</p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-md px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{backgroundColor:"#173946"}}
            >
              {t.cart.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col divide-y divide-line border-t border-b border-line">
              {items.map((item) => (
                <div key={item.key} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-cream-soft">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-[10rem] flex-1">
                    <p className="font-medium" style={{color:"#000"}}>{item.name}</p>
                    <p className="text-m" style={{color:"#000"}}>
                      {[item.size, ...item.variants.map((v) => `${v.name}: ${v.value}`)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 text-m" style={{color:"#000"}}>
                      {item.price.toLocaleString("en-US")} AED
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border"
                      style={{borderColor:"#173946", color:"#173946"}}
                    >
                      &minus;
                    </button>
                    <span className="w-6 text-center text-m" style={{color:"#000"}}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border"
                      style={{borderColor:"#173946", color:"#173946"}}
                    >
                      +
                    </button>
                  </div>

                  <p className="w-24 text-right text-s" style={{color:"#000"}}>
                    {(item.price * item.quantity).toLocaleString("en-US")} AED
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-m hover:text-red-600"
                    style={{color:"#000"}}
                  >
                    {t.cart.remove}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-lg font-medium" style={{color:"#000"}}>{t.cart.subtotal}</p>
              <p className="font-heading text-lg" style={{color:"#173946"}}>
                {subtotal.toLocaleString("en-US")} AED
              </p>
            </div>

            {/* Tabby & Tamara cart widgets — required by QA on cart page, updates with cart total */}
            <div className="flex flex-col gap-2">
              <TabbyPromoWidget price={subtotal} currency="AED" source="cart" />
              <TamaraPromoWidget price={subtotal} currency="AED" type="installment-plan" />
            </div>

            <Link
              href="/checkout"
              className="self-end rounded-md px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              style={{backgroundColor:"#173946"}}
            >
              {t.cart.proceedToCheckout}
            </Link>
          </div>
        )}
    </main>
  );
}
