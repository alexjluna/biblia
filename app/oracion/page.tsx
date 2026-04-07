import { auth } from "@/lib/auth";
import { getPrayerRequests } from "@/lib/queries/prayers";
import { PrayerWall } from "@/components/PrayerWall";

export const dynamic = "force-dynamic";

export default async function OracionPage() {
  const session = await auth();
  const requests = getPrayerRequests(session?.user?.id ?? null);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
          Muro de Oración
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Comparte tus peticiones y ora por otros
        </p>
      </header>

      <PrayerWall
        initialRequests={requests}
        isLoggedIn={!!session?.user?.id}
      />
    </div>
  );
}
