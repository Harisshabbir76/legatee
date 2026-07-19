"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import styles from "../styles/Navbar.module.css";

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l-1 12H7L6 8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6.5a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CartButton() {
  const { totalCount } = useCart();
  const { openCart } = useWishlist();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Cart"
      className={styles.iconButton}
      style={{ position: "relative", cursor: "pointer" }}
    >
      <BagIcon />
      {totalCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -6,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            borderRadius: 999,
            background: "var(--color-maroon)",
            color: "white",
            fontSize: 10,
            lineHeight: "16px",
            textAlign: "center",
          }}
        >
          {totalCount}
        </span>
      )}
    </button>
  );
}
