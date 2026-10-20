import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Endpoint better-auth: mulai login Google, callback Google (/api/auth/callback/google), sesi, keluar
export const { GET, POST } = toNextJsHandler(auth);
