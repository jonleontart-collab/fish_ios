import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { LanguageProvider } from "@/components/LanguageProvider";
import { LocationProvider } from "@/components/LocationProvider";
import { MessageNotifications } from "@/components/MessageNotifications";
import { NotificationCenter } from "@/components/NotificationCenter";
import Onboarding from "@/components/Onboarding";
import TabBar from "@/components/TabBar";
import { ToastProvider } from "@/components/ToastProvider";
import { withBasePath } from "@/lib/app-paths";
import { getServerLanguage } from "@/lib/i18n-server";
import { getCurrentUser } from "@/lib/queries";
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
  description: "FishFlow fishing network with feed, places, trips, chats, and AI tools.",
  manifest: withBasePath("/manifest.json"),
};

export const viewport: Viewport = {
  themeColor: "#07111c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLanguage();
  const user = await getCurrentUser();

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-text-main">
        <LanguageProvider initialLanguage={lang}>
          <ToastProvider>
            <LocationProvider>
              {user ? (
                <>
                  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
                    <div className="absolute bottom-[-10rem] right-[-8rem] h-[22rem] w-[22rem] rounded-full bg-accent/12 blur-[120px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(133,194,255,0.08),transparent_32%),radial-gradient(circle_at_bottom,rgba(103,232,178,0.08),transparent_28%)]" />
                  </div>

                  <MessageNotifications currentUserId={user.id} />
                  <NotificationCenter currentUserId={user.id} />
                  <main className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-32">{children}</main>
                  <TabBar />
                </>
              ) : (
                <Onboarding />
              )}
            </LocationProvider>
          </ToastProvider>
        </LanguageProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('${withBasePath("/sw.js")}');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
