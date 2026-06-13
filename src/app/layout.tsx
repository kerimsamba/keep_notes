import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { StorageProvider } from "@/contexts/StorageContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fbbf24",
};

export const metadata: Metadata = {
  title: "Keep Notes - Your Notes, Organized",
  description:
    "A Google Keep style notes app that stores your notes in a GitHub repo you own - organize your notes, todos, and ideas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keep Notes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StorageProvider>
          {children}
        </StorageProvider>
      </body>
    </html>
  );
}
