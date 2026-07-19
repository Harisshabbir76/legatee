"use client";

import Link from "next/link";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { optimizeImage } from "@/lib/cloudinary";
import { productPath } from "@/lib/product-slug";
import { useLanguage } from "./LanguageContext";
import { getT } from "@/lib/translations";

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WishlistSidebar() {
  const { wishlistItems, isWishlistOpen, closeWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { lang } = useLanguage();
  const t = getT(lang);

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ height: "100dvh" }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        style={{ height: "100dvh" }}
        onClick={closeWishlist}
      />

      {/* Sidebar Panel (Right Side) */}
      <div className="relative flex flex-col bg-white shadow-2xl animate-slide-in-right" style={{ width: 380, maxWidth: "90%", height: "100dvh" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-heading text-xl font-normal" style={{color:"#173946"}}>
            {t.wishlist.title} ({wishlistItems.length})
          </h2>
          <button
            type="button"
            onClick={closeWishlist}
            className="text-2xl p-1 font-body cursor-pointer" style={{color:"#000"}}
            aria-label="Close wishlist"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {wishlistItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm" style={{color:"#000"}}>{t.wishlist.empty}</p>
              <button
                onClick={closeWishlist}
                className="mt-4 rounded-md px-5 py-2.5 text-xs font-medium text-white transition hover:opacity-90 uppercase tracking-widest cursor-pointer"
                style={{backgroundColor:"#173946"}}
              >
                {t.wishlist.explore}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 divide-y divide-gray-100">
              {wishlistItems.map((product, idx) => (
                <div key={product.id} className={`flex items-start gap-4 ${idx > 0 ? "pt-6" : ""}`}>
                  {/* Square Image */}
                  <Link
                    href={productPath(product)}
                    onClick={closeWishlist}
                    className="h-20 w-20 flex-shrink-0 overflow-hidden"
                  >
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={optimizeImage(product.images[0], 160)}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-cream-soft" />
                    )}
                  </Link>

                  {/* Info & Buttons */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={productPath(product)}
                      onClick={closeWishlist}
                      className="font-body font-semibold text-m uppercase tracking-wider block truncate"
                      style={{color:"#000"}}
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-s font-semibold" style={{color:"#000"}}>
                      {product.price.toLocaleString("en-US")} AED
                    </p>

                    {/* Action Row */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            productId: product.id,
                            name: product.name,
                            image: product.images?.[0],
                            price: product.price,
                            size: product.sizes?.[0] || undefined,
                            variants: [],
                            quantity: 1,
                          });
                        }}
                        className="flex-1 min-w-0 rounded-none py-2 text-xs font-medium text-white hover:opacity-90 transition text-center uppercase tracking-wide cursor-pointer"
                        style={{backgroundColor:"#173946"}}
                      >
                        {t.wishlist.addToCart}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className="flex-shrink-0 text-gray-700 hover:text-red-600 transition p-1 cursor-pointer"
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
        {wishlistItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white">
            <Link
              href="/wishlist"
              onClick={closeWishlist}
              className="flex w-full items-center justify-center py-3 text-xs font-semibold text-white hover:opacity-90 transition uppercase tracking-widest text-center"
              style={{backgroundColor:"#173946"}}
            >
              {t.wishlist.viewFull}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
