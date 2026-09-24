import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { PwaProvider } from "@/components/pwa-provider";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Forma",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Forma",
  },
  title: "Forma",
  description: "Nutrition, workouts, and AI coaching for steady progress.",
  icons: {
    apple: "/icon-192.png",
    icon: [
      { sizes: "192x192", url: "/icon-192.png", type: "image/png" },
      { sizes: "512x512", url: "/icon-512.png", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#123f31",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('forma.theme')||'light';document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
        <NextIntlClientProvider>
          <PwaProvider />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
