import { lang as langParam } from "next/root-params";

import { defaultLang, hasLang, type Lang } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

/** Bahasa halaman saat ini, dibaca dari segmen [lang] (Server Component saja) */
export async function getLang(): Promise<Lang> {
  const l = await langParam();
  return hasLang(l) ? l : defaultLang;
}

export async function getDict() {
  return dictionaries[await getLang()];
}
