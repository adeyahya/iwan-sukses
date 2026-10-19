import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/db/schema";

// Lokal: file SQLite di data/. Produksi: arahkan DATABASE_URL ke file di disk permanen
// atau ke database libSQL/Turso (libsql://..., dengan DATABASE_AUTH_TOKEN).
export const databaseUrl = process.env.DATABASE_URL ?? "file:data/iwan-sukses.db";

// Folder file database lokal dibuat otomatis
if (databaseUrl.startsWith("file:")) mkdirSync(dirname(databaseUrl.slice("file:".length)), { recursive: true });

const client = createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN });

export const db = drizzle(client, { schema });
