import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import Providers from "./providers";
import { getSeoSettings } from "@/services/seo.service";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  // getSeoSettings now handles all errors internally and always returns valid settings
  const seoSettings = await getSeoSettings();
  
  return {
    title: seoSettings.metaTitle,
    description: seoSettings.metaDescription,
    keywords: seoSettings.metaKeywords,
    openGraph: {
      title: seoSettings.ogTitle,
      description: seoSettings.ogDescription,
      images: [
        {
          url: seoSettings.ogImage,
          width: 1200,
          height: 630,
          alt: seoSettings.ogTitle,
        },
      ],
      type: 'website',
      siteName: seoSettings.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoSettings.twitterTitle,
      description: seoSettings.twitterDescription,
      images: [seoSettings.twitterImage],
    },
    icons: {
      icon: seoSettings.favicon,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-accent-obsidian min-h-screen`}>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
