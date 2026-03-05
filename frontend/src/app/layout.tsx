import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudSecure Dashboard",
  description: "Cloud Security Scanning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>

        {/* Navbar */}
        <nav className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">CloudSecure</span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-green-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/" className="hover:text-green-400 transition-colors">
              Scans
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}