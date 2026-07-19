"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ar";

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageCtx>({ lang: "en", setLang: () => {} });

const COOKIE_KEY = "legatee_lang";

function saveLang(l: Lang) {
  localStorage.setItem(COOKIE_KEY, l);
  document.cookie = `${COOKIE_KEY}=${l}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageProvider({
  children,
  defaultLang = "en",
}: {
  children: React.ReactNode;
  defaultLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => { setLangState(defaultLang); }, [defaultLang]);

  function setLang(l: Lang) {
    setLangState(l);
    saveLang(l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
