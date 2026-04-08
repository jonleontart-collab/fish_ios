import { AddCatchForm } from "@/components/AddCatchForm";
import { getPlaceOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AddPage() {
  const places = await getPlaceOptions();

  return <AddCatchForm places={places} />;
}
