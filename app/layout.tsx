import type { Metadata } from "next";
import { Battambang, Geist, Geist_Mono, Moul } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const battambang = Battambang({
  variable: "--font-khmer-body",
  subsets: ["khmer"],
  weight: ["300", "400", "700"],
});

const moul = Moul({
  variable: "--font-khmer-heading",
  subsets: ["khmer"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Angkor Go",
  description:
    "Interactive Siem Reap travel planner with smart filters, Khmer-friendly UI, and full-screen location maps.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-travel.png",
    apple: "/icon-travel.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${battambang.variable} ${moul.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
