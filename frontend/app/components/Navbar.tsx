"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../images/logo.svg";
import styles from "../styles/Navbar.module.css";
import CartButton from "./CartButton";
import { useWishlist } from "./WishlistContext";
import { useUser } from "./UserContext";
import { useLanguage } from "./LanguageContext";
import { getT } from "@/lib/translations";

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.35-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="256"
        cy="256"
        r="225"
        stroke="currentColor"
        strokeWidth="30"
      />
      <circle
        cx="256"
        cy="190"
        r="78"
        stroke="currentColor"
        strokeWidth="30"
      />
      <path
        d="M120 430c15-90 91-145 136-145s121 55 136 145"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function Navbar({ solid }: { solid?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [perfumeOpen, setPerfumeOpen] = useState(false);
  const [sidebarPerfumeOpen, setSidebarPerfumeOpen] = useState(false);
  const { openWishlist, wishlistItems } = useWishlist();
  const { user } = useUser();
  const { lang } = useLanguage();
  const t = getT(lang);
  const wishlistCount = wishlistItems.length;

  const leftLinks = [
    { label: t.nav.shop, href: "/shop" },
    { label: t.nav.allOverSpray, href: "/all-over-spray" },
  ];
  const rightLinks = [
    { label: t.nav.ourStory, href: "/our-story" },
    { label: t.nav.contactUs, href: "/contact-us" },
  ];

  const perfumeDropdownItems = [
    { label: t.nav.signaturePerfume, href: "/signature-perfume" },
    { label: t.nav.kandoraPerfume, href: "/kandora-perfume" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    // Reset sidebar dropdown when closing
    if (isOpen) {
      setSidebarPerfumeOpen(false);
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setSidebarPerfumeOpen(false);
  };

  const toggleSidebarPerfume = (e: React.MouseEvent) => {
    e.preventDefault();
    setSidebarPerfumeOpen(!sidebarPerfumeOpen);
  };

  return (
    <>
      <header className={`${styles.header} ${(solid || scrolled) ? styles.scrolled : styles.transparent}`}>
        <nav className={styles.nav}>
          {/* Hamburger */}
          <button 
            className={`${styles.hamburger} ${isOpen ? styles.active : ""}`} 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Left links */}
          <ul className={styles.leftLinks}>
            <li>
              <Link href="/shop" className={styles.navLink}>{t.nav.shop}</Link>
            </li>
            <li
              className={styles.dropdownItem}
              onMouseEnter={() => setPerfumeOpen(true)}
              onMouseLeave={() => setPerfumeOpen(false)}
            >
              <span className={styles.navLinkDropdown}>
                {t.nav.perfume}
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {perfumeOpen && (
                <ul className={styles.dropdown}>
                  <li><Link href="/signature-perfume" className={styles.dropdownLink} onClick={() => setPerfumeOpen(false)}>{t.nav.signaturePerfume}</Link></li>
                  <li><Link href="/kandora-perfume" className={styles.dropdownLink} onClick={() => setPerfumeOpen(false)}>{t.nav.kandoraPerfume}</Link></li>
                </ul>
              )}
            </li>
            <li>
              <Link href="/all-over-spray" className={styles.navLink}>{t.nav.allOverSpray}</Link>
            </li>
          </ul>

          {/* Center logo */}
          <Link href="/" className={styles.logo}>
            <Image
              src={logoImg}
              alt="Legatee"
              className={styles.logoImg}
              priority
            />
          </Link>

          {/* Right links + icons */}
          <div className={styles.rightGroup}>
            <ul className={styles.rightLinks}>
              {rightLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={styles.icons}>
              <CartButton />
              <button
                aria-label="Wishlist"
                className={styles.iconButton}
                onClick={openWishlist}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <HeartIcon />
                {wishlistCount > 0 && (
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
                    {wishlistCount}
                  </span>
                )}
              </button>
              <Link
                href={user ? "/profile" : "/login"}
                aria-label="Account"
                className={styles.iconButton}
                style={{ display: "inline-flex" }}
              >
                <UserIcon />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.open : ""}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar with dropdown */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <ul className={styles.sidebarLinks}>
          {/* Shop link */}
          <li>
            <Link href="/shop" className={styles.sidebarLink} onClick={closeSidebar}>
              {t.nav.shop}
            </Link>
          </li>
          
          {/* Perfume dropdown in sidebar */}
          <li className={styles.sidebarDropdown}>
            <button 
              className={styles.sidebarDropdownToggle} 
              onClick={toggleSidebarPerfume}
            >
              <span>{t.nav.perfume}</span>
              <span className={`${styles.sidebarDropdownArrow} ${sidebarPerfumeOpen ? styles.open : ""}`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            <ul className={`${styles.sidebarDropdownMenu} ${sidebarPerfumeOpen ? styles.open : ""}`}>
              {perfumeDropdownItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.sidebarDropdownLink} onClick={closeSidebar}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          
          {/* All Over Spray link */}
          <li>
            <Link href="/all-over-spray" className={styles.sidebarLink} onClick={closeSidebar}>
              {t.nav.allOverSpray}
            </Link>
          </li>
          
          {/* Right links */}
          {rightLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className={styles.sidebarLink} onClick={closeSidebar}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}