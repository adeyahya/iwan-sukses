import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin Iwan Sukses" },
  robots: { index: false, follow: false },
};

// Panel admin membaca sesi dan database di setiap permintaan, jadi tidak perlu dinilai untuk navigasi instan
export const instant = false;

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-secondary">{children}</div>;
}
