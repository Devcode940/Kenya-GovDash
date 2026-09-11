import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PwaInstallPrompt } from "@/components/kenya/PwaInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kenya Government Accountability Dashboard — 2022–2027",
  description: "Interactive dashboard for Kenya government representative hierarchy, performance tracking, and accountability oversight. Factual, source-cited, data-gap transparent.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kenya GovDash",
  },
  applicationName: "Kenya GovDash",
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster />
            <ServiceWorkerRegister />
            <PwaInstallPrompt />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
