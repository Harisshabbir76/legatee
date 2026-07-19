"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

if (typeof window !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

export default function ScrollToTop() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "";
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
