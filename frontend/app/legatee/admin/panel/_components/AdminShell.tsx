"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import styles from "@/app/styles/dashboard styling/sidebar.module.css";

export default function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname, isClient]);

  useEffect(() => {
    if (!sidebarOpen || !isClient) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, isClient]);

  useEffect(() => {
    if (!sidebarOpen || !isClient) return;
    if (window.innerWidth >= 1024) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen, isClient]);

  return (
    <div className={styles.shell}>
      {/* Always render the overlay div, but hide it with CSS when not needed */}
      <div 
        className={styles.sidebarOverlay}
        style={{ display: (isClient && sidebarOpen) ? 'block' : 'none' }}
        onClick={() => setSidebarOpen(false)}
      />

      <AdminSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <div className={styles.shellContent}>
        <header className={styles.shellHeader}>
          <div className={styles.shellHeaderLeft}>
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className={styles.shellHamburger}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className={styles.shellTitle}>{title}</h1>
          </div>
          {actions}
        </header>

        <main className={styles.shellMain}>{children}</main>
      </div>
    </div>
  );
}