import { ExploreShell } from "@/components/ExploreShell";
import { getPlacesCatalog } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const places = await getPlacesCatalog();

  return <ExploreShell places={places} />;
}
