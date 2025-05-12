import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';
import Header from "@/components/Header";
import SessionWrapper from "./components/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Nothing Apps',
    template: '%s',
  },
  description: 'Discover innovative bots and virtual assistants at Nothing Apps.',
  alternates: {
    canonical: 'http://localhost:3000',
  },
  openGraph: {
    type: 'website',
    url: 'http://localhost:3000',
    title: 'Nothing Apps',
    description: 'Discover innovative bots and virtual assistants at Nothing Apps.',
    images: ['/default-og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nothing Apps',
    description: 'Discover innovative bots and virtual assistants at Nothing Apps.',
    images: ['/default-og-image.jpg'],
  }
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
       <Script
          src="http://localhost:3000/_next/static/chunks/non-critical.js"
          strategy="lazyOnload"
        /><SessionWrapper>
          <Header />
        {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
