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
  title: "DP Visualizer — Dynamic Programming Animations",
  description:
    "Interactive visualizations for classic dynamic programming algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-[#1e1e2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                DP
              </div>
              <span className="font-semibold text-lg tracking-tight">
                DP <span className="text-indigo-400">Visualizer</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
            >
              All Algorithms
            </Link>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
