import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { SessionWrapper } from "@/components/SessionWrapper";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BibleVersionProvider } from "@/components/BibleVersionProvider";
import { DEFAULT_VERSION, VALID_VERSIONS, type BibleVersionId } from "@/lib/version";

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
  title: "Biblia",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieVersion = cookieStore.get("bible_version")?.value;
  const initialVersion: BibleVersionId =
    cookieVersion && VALID_VERSIONS.includes(cookieVersion as BibleVersionId)
      ? (cookieVersion as BibleVersionId)
      : DEFAULT_VERSION;

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${sourceSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {isProduction && (
          <>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-NK370ZL180" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-NK370ZL180');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-parchment text-text-primary">
        <SessionWrapper>
          <BibleVersionProvider initialVersion={initialVersion}>
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
          </BibleVersionProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
