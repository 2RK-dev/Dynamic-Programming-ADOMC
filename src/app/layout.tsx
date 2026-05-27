import type { Metadata } from "next";
import { Instrument_Serif, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DP Visualizer",
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
      className={`${instrumentSerif.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="sticky top-0 z-50 bg-[#0c0c0e]/90 backdrop-blur-sm border-b border-[#27272a]">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2 group">
              <span className="font-display text-xl tracking-tight text-[#fafafa]">
                dp
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#71717a] font-medium">
                visualizer
              </span>
            </Link>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.15em] text-[#71717a] hover:text-[#d4a574] transition-colors"
            >
              Index
            </Link>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
