"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import LogoutButton from "./LogoutButton";
import styles from "@/app/styles/dashboard styling/sidebar.module.css";

const pageLinks = [
  { label: "Home Page",          href: "/legatee/admin/panel/homepage" },
  { label: "Shop",               href: "/legatee/admin/panel/shop" },
  { label: "Signature Perfume",  href: "/legatee/admin/panel/signature-perfume" },
  { label: "Kandora Perfume",    href: "/legatee/admin/panel/kandora-perfume" },
  { label: "All Over Spray",     href: "/legatee/admin/panel/all-over-spray" },
  { label: "About Us",           href: "/legatee/admin/panel/about-us" },
  { label: "FAQ",                href: "/legatee/admin/panel/faq" },
  { label: "Legal",              href: "/legatee/admin/panel/legal" },
  { label: "Contact Us",         href: "/legatee/admin/panel/contact-us" },
];

const navItems = [
  { label: "Orders",           href: "/legatee/admin/panel/orders" },
  { label: "Catalog",          href: "/legatee/admin/panel/products" },
  { label: "Add Product",      href: "/legatee/admin/panel/products/new" },
  { label: "Collections",      href: "/legatee/admin/panel/collections" },
  { label: "Shipping",         href: "/legatee/admin/panel/shipping" },
  { label: "Email Marketing",  href: "/legatee/admin/panel/email-marketing" },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      className={`${styles.sidebarChevron} ${open ? styles.sidebarChevronOpen : ""}`}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const pagesActive = pageLinks.some((p) => pathname === p.href);
  const [pagesOpen, setPagesOpen] = useState(pagesActive);
  const pagesRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (pagesOpen) {
      pagesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [pagesOpen]);

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.sidebarBrand}>
        <span className={styles.sidebarBrandText}>Legatee Admin</span>
        <button
          type="button"
          onClick={onToggle}
          className={styles.sidebarToggleBtn}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          style={{ display: open ? "none" : "flex" }}
        >
          <HamburgerIcon />
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.sidebarNavList}>

          <li>
            <Link
              href="/legatee/admin/panel"
              className={`${styles.sidebarLink} ${pathname === "/legatee/admin/panel" ? styles.sidebarLinkActive : ""}`}
            >
              Dashboard
            </Link>
          </li>

          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.sidebarLink} ${pathname === item.href ? styles.sidebarLinkActive : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          <li ref={pagesRef}>
            <button
              onClick={() => setPagesOpen((o) => !o)}
              className={`${styles.sidebarDropdownBtn} ${pagesActive && !pagesOpen ? styles.sidebarDropdownBtnActive : ""}`}
            >
              <span>Pages</span>
              <ChevronIcon open={pagesOpen} />
            </button>

            {pagesOpen && (
              <ul className={styles.sidebarSubList}>
                {pageLinks.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className={`${styles.sidebarSubLink} ${pathname === page.href ? styles.sidebarSubLinkActive : ""}`}
                    >
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <LogoutButton />
      </div>
    </aside>
  );
}
