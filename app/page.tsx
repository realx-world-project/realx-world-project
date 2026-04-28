import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/home");
  }

  // This code is unreachable due to redirects above
  // Landing stub for unauthenticated users
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">RealX World</h1>
        <p className="text-lg text-gray-700 mb-8">
          Nigeria's premier real estate marketplace platform.
        </p>
        <div className="space-x-4">
          <a
            href="/listings"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Browse Listings
          </a>
          <a
            href="/register"
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}
