"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/api";

interface WishlistContextValue {
  wishlistItems: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "legatee_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpenInternal] = useState(false);
  const [isWishlistOpen, setIsWishlistOpenInternal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWishlistItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems, hydrated]);

  const setCartOpen = (open: boolean) => {
    setIsCartOpenInternal(open);
    if (open) {
      setIsWishlistOpenInternal(false);
    }
  };

  const setWishlistOpen = (open: boolean) => {
    setIsWishlistOpenInternal(open);
    if (open) {
      setIsCartOpenInternal(false);
    }
  };

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);
  const openWishlist = () => setWishlistOpen(true);
  const closeWishlist = () => setWishlistOpen(false);

  function toggleWishlist(product: Product) {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }

  function isWishlisted(id: string) {
    return wishlistItems.some((item) => item.id === id);
  }

  const value = useMemo(
    () => ({
      wishlistItems,
      toggleWishlist,
      isWishlisted,
      isCartOpen,
      isWishlistOpen,
      setCartOpen,
      setWishlistOpen,
      openCart,
      closeCart,
      openWishlist,
      closeWishlist,
    }),
    [wishlistItems, isCartOpen, isWishlistOpen]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
