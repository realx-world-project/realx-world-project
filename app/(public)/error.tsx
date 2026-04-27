"use client";

import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}