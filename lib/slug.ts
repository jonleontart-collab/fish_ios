import crypto from "node:crypto";

const transliterationMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function slugify(value: string) {
  const transliterated = [...value.toLowerCase()]
    .map((char) => transliterationMap[char] ?? char)
    .join("");

  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function createPlaceSlug(name: string, latitude: number, longitude: number) {
  const base = slugify(name) || "place";
  const suffix = crypto
    .createHash("sha1")
    .update(`${name}:${latitude.toFixed(5)}:${longitude.toFixed(5)}`)
    .digest("hex")
    .slice(0, 8);

  return `${base}-${suffix}`;
}

export function createChatSlug(title: string) {
  const base = slugify(title) || "chat";
  const suffix = crypto.createHash("sha1").update(title).digest("hex").slice(0, 6);

  return `${base}-${suffix}`;
}
