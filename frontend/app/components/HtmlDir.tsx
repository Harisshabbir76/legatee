"use client";

import { useEffect } from "react";
import { useLanguage } from "./LanguageContext";

export default function HtmlDir() {
  const { lang } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === "ar") {
      document.documentElement.classList.add("lang-ar");
    } else {
      document.documentElement.classList.remove("lang-ar");
    }
  }, [lang]);
  return null;
}
