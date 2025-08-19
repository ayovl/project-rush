import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DePIX - AI Image Generation",
  description: "Generate stunning images with AI using character references and advanced prompting",
  keywords: ["AI", "image generation", "ideogram", "character reference", "art"],
  authors: [{ name: "DePIX Team" }],
  openGraph: {
    title: "DePIX - AI Image Generation",
    description: "Generate stunning images with AI using character references and advanced prompting",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#0B0F13]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
