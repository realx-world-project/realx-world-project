import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { Providers } from "@/components/shared/Providers";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Relex World",
  description: "Nigeria-focused real estate listings and marketplace platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
