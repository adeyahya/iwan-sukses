"use client";

import { createContext, useContext } from "react";

import { defaultLang, localePath, type Lang } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

// Komponen client tidak bisa membaca segmen [lang]; root layout menyediakannya lewat context
const LangContext = createContext<Lang>(defaultLang);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext value={lang}>{children}</LangContext>;
}

export const useLang = () => useContext(LangContext);
export const useDict = () => dictionaries[useLang()];

export function useLocalePath() {
  const lang = useLang();
  return (href: string) => localePath(lang, href);
}
