import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SavedSearchesList, type SavedSearchItem } from "@/components/dashboard/SavedSearchesList";

export default async function SavedSearchesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id as string;
  const db: any = prisma;

  const searches = await db.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const initialSearches: SavedSearchItem[] = searches.map((s: any) => ({
    id: s.id,
    name: s.name,
    query: s.query,
    filters: s.filters ?? {},
    href: s.href,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Saved Searches</h1>
        <p className="mt-1 text-muted-foreground">Your saved property searches</p>
      </div>

      <SavedSearchesList initialSearches={initialSearches} />
    </div>
  );
}
