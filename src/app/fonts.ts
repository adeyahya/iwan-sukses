import { Inter, Poppins } from "next/font/google";

// Dipakai oleh kedua root layout (situs [lang] dan admin)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const fontVariables = `${inter.variable} ${poppins.variable}`;
