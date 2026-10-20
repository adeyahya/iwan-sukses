import Image from "next/image";

// Kartu di tengah layar untuk halaman masuk dan undangan
export function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 sm:p-8">
        <Image src="/logo/lockup-horizontal_black.svg" alt="Iwan Sukses" width={146} height={40} className="mb-6 h-9 w-auto" />
        <h1 className="mb-1 font-heading text-xl font-bold">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
    </main>
  );
}
