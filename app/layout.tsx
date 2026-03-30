import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relex World",
  description: "Nigeria-focused real estate listings and marketplace platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
