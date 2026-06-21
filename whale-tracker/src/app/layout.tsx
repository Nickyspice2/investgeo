import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whale Tracker — Real-time Crypto Transaction Monitor",
  description: "Monitor large cryptocurrency transactions in real time. Track whale movements across BTC, ETH, SOL, and more.",
  keywords: ["crypto", "whale", "blockchain", "bitcoin", "ethereum", "transactions", "finance"],
};

export const viewport: Viewport = {
  themeColor: "#080B10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </body>
    </html>
  );
}
