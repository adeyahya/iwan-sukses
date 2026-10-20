import { desc } from "drizzle-orm";
import type { Metadata } from "next";

import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { DeleteInviteButton, DeleteUserButton, InviteForm } from "@/app/admin/(panel)/pengguna/user-controls";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { invites, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export const metadata: Metadata = { title: "Pengguna" };

const date = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

export default async function UsersAdmin() {
  const me = await requireAdmin();
  const [accounts, pending] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt }).from(users).orderBy(users.id),
    db.select().from(invites).orderBy(desc(invites.createdAt)),
  ]);

  return (
    <>
      <PageHead title="Pengguna" description="Semua akun di sini adalah admin dan bisa mengubah seluruh isi situs. Semua masuk dengan akun Google; undang admin baru dengan email Google-nya." />
      <div className="grid gap-6">
        <Panel>
          <h2 className="mb-4 font-heading text-lg font-bold">Undang admin</h2>
          <InviteForm />
        </Panel>

        {pending.length > 0 && (
          <section>
            <h2 className="mb-2 font-heading text-lg font-bold">Diundang, belum pernah masuk</h2>
            <ul className="divide-y rounded-lg border bg-background">
              {pending.map((i) => (
                <li key={i.id} className="flex items-center gap-3 p-3">
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm">{i.email}</b>
                    <span className="block text-xs text-muted-foreground">Diundang {date(i.createdAt)}</span>
                  </span>
                  <DeleteInviteButton id={i.id} email={i.email} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-2 font-heading text-lg font-bold">Admin</h2>
          <ul className="divide-y rounded-lg border bg-background">
            {accounts.map((u) => (
              <li key={u.id} className="flex items-center gap-3 p-3">
                <span className="min-w-0 flex-1">
                  <b className="flex items-center gap-2 text-sm">
                    {u.name}
                    {u.id === me.id && <Badge className="rounded-sm">Anda</Badge>}
                  </b>
                  <span className="block truncate text-xs text-muted-foreground">
                    {u.email} · sejak {date(u.createdAt)}
                  </span>
                </span>
                {u.id !== me.id && <DeleteUserButton id={u.id} name={u.name} />}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
