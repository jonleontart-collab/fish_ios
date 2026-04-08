const SPECIES_BADGES: Record<string, string> = {
  "щука": "/graphics/badge-pike.png",
  "судак": "/graphics/badge-zander.png",
  "окунь": "/graphics/badge-perch.png",
  "карп": "/graphics/badge-carp.png",
  "форель": "/graphics/badge-trout.png",
  "сом": "/graphics/badge-catfish.png",
  "белый амур": "/graphics/badge-carp.png",
  "карась": "/graphics/badge-carp.png",
};

export function getSpeciesBadge(species: string) {
  return SPECIES_BADGES[species.trim().toLowerCase()] ?? "/graphics/badge-pike.png";
}
