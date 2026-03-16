import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import AuthHydration from "@/components/shared/AuthHydration";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireMe — Hire Smarter, Together",
  description:
    "Find your next opportunity or hire top talent. HireMe connects candidates with companies through a seamless, modern hiring experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,800,900&display=swap"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${geistMono.variable} min-h-screen subpixel-antialiased font-satoshi`}
      >
        <AuthHydration />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              opacity: 1,
            },
          }}
        />
      </body>
    </html>
  );
}
