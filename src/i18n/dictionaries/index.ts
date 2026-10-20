import type { Lang } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";

export type Dict = typeof id;

// Kamus kecil dan dipakai juga oleh komponen client, jadi keduanya dimuat langsung (bukan import dinamis)
export const dictionaries: Record<Lang, Dict> = { id, en };
