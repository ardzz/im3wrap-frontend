import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SonnerProvider } from "@/components/providers/sonner-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IM3Wrap - Package Management System",
  description: "IM3 package management and purchase system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SonnerProvider />
      </body>
    </html>
  );
}