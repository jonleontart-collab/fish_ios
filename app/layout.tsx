import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { LocationProvider } from "@/components/LocationProvider";
import TabBar from "@/components/TabBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "FishFlow",
    template: "%s · FishFlow",
  },
  description: "Рыболовная соцсеть с лентой, картой мест, поездками, чатами и AI-поиском точек рядом.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#07111c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" className={`${inter.variable}`}>
      <body className="min-h-screen bg-background text-text-main font-sans">
        <LocationProvider>
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
            <div className="absolute bottom-[-10rem] right-[-8rem] h-[22rem] w-[22rem] rounded-full bg-accent/12 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(133,194,255,0.08),transparent_32%),radial-gradient(circle_at_bottom,rgba(103,232,178,0.08),transparent_28%)]" />
          </div>

          <main className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-32">{children}</main>
          <TabBar />
        </LocationProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
