import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { Providers } from "./(dashboard)/dashboard/providers";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = GeistSans; // Using the direct import
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "SaleSpider - Smart Inventory & Sales",
  description:
    "A Next.js DApp for sales and inventory management using account abstraction for SaleSpider.",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="salepider-theme"
            themes={["light", "dark", "system"]}
          >
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
