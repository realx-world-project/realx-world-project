import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.realxworld.net"),
  title: {
    default: "RealX World — Real Estate Open Market",
    template: "%s | RealX World",
  },
  description:
    "A world of varied real estate transactions and exchange. Browse properties for sale, rent, and lease across Nigeria.",
  keywords: [
    "real estate Nigeria",
    "property for sale Nigeria",
    "houses for rent Lagos",
    "land for sale",
    "RealX World",
    "Nigerian property market",
  ],
  authors: [{ name: "RealX World", url: "https://www.realxworld.net" }],
  creator: "RealX World",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://www.realxworld.net",
    siteName: "RealX World",
    title: "RealX World — Real Estate Open Market",
    description:
      "A world of varied real estate transactions and exchange. Browse properties for sale, rent, and lease across Nigeria.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RealX World — Real Estate Open Market",
    description: "Browse properties for sale, rent, and lease across Nigeria.",
    creator: "@realxworld",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
