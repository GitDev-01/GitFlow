import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"

import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  fallback: ["arial"],
  subsets: ["latin"],
});

const nunito = Nunito({
  weight: "400",
  variable: "--font-nunito",
  fallback: ["arial"],
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Git Flow",
  description: "A Gitlab Flow visual editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.className}>
      <body
        className={`${nunito.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
