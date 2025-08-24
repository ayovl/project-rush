import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let plan = null;
  let credits = 0;
  let hasSeenOnboarding = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('selected_plan, credits, has_seen_onboarding')
      .eq('id', user.id)
      .single();

    if (profile) {
      plan = profile.selected_plan === 'none' ? null : profile.selected_plan;
      credits = profile.credits ?? 0;
      hasSeenOnboarding = profile.has_seen_onboarding ?? false;
    }
  }

  const serverSession = { user, plan, credits, hasSeenOnboarding };

  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#0B0F13]`}>
        <AuthProvider serverSession={serverSession}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
