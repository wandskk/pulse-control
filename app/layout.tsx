import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalLoadingOverlay } from "@/components/shared/global-loading-overlay";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { Toaster } from "@/components/ui/sonner";
import { PWA_THEME_COLOR } from "@/lib/constants/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "PulseControl",
    template: "%s · PulseControl",
  },
  description: "PWA mobile first — controle remoto via comandos.",
  applicationName: "PulseControl",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PulseControl",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
        <GlobalLoadingOverlay />
        <Toaster
          richColors
          position="top-center"
          className="!z-[200]"
        />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
