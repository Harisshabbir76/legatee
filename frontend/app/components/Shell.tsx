"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { FooterData } from "@/lib/api";

const EXCLUDED = ["/login", "/signup", "/legatee", "/checkout"];

export default function Shell({ children, footerContent }: { children: React.ReactNode; footerContent?: FooterData | null }) {
  const pathname = usePathname();
  const hide = EXCLUDED.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith("/legatee"));
  const TRANSPARENT_PAGES = ["/", "/our-story", "/contact-us"];
  const solid = !TRANSPARENT_PAGES.includes(pathname);

  return (
    <>
      {!hide && <Navbar solid={solid} />}
      {children}
      {!hide && <Footer content={footerContent} />}
    </>
  );
}
