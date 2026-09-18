import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ComparisonTray } from "@/components/listings/ComparisonTray";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      <ComparisonTray />
    </div>
  );
}