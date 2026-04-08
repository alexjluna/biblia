import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { SessionWrapper } from "@/components/SessionWrapper";
import { InstallPrompt } from "@/components/InstallPrompt";

const isProduction = process.env.NODE_ENV === "production";

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
  title: "Biblia — Reina Valera 1960",
  description:
    "Lee la Biblia, guarda tus versículos favoritos y compártelos por WhatsApp",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Biblia",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#7C5C3E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${sourceSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-text-primary">
        {isProduction && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-NK370ZL180"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-NK370ZL180');
              `}
            </Script>
          </>
        )}
        <SessionWrapper>
          <main className="flex-1 pb-20">{children}</main>
          <footer className="pb-18 text-center py-3">
            <a
              href="/legal"
              className="text-xs text-text-secondary hover:text-accent transition-colors"
            >
              Aviso legal
            </a>
          </footer>
          <InstallPrompt />
          <TabBar />
        </SessionWrapper>
      </body>
    </html>
  );
}
