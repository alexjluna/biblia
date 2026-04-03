import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/TabBar";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biblia — Reina Valera 1909",
  description:
    "Lee la Biblia, guarda tus versículos favoritos y compártelos por WhatsApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sourceSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-text-primary">
        <main className="flex-1 pb-16">{children}</main>
        <TabBar />
      </body>
    </html>
  );
}
