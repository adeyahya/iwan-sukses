import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { createSession, googleProfile, signInWithGoogle } from "@/lib/auth";

// Google kembali ke sini dengan ?code=&state= (atau ?error= kalau dibatalkan)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) redirect("/admin/login?error=cancelled");

  const profile = await googleProfile(request.nextUrl.origin, code, state);
  if (!profile) redirect("/admin/login?error=google");
  const result = await signInWithGoogle(profile);
  if ("error" in result) redirect(`/admin/login?error=${result.error}`);
  await createSession(result.userId);
  redirect("/admin");
}
