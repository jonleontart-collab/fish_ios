import { z } from "zod";

import { getFishingEvents } from "@/lib/fishing-events";
import { normalizeLanguage } from "@/lib/i18n";

const eventsRequestSchema = z.object({
  country: z.string().trim().max(80).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  lang: z.string().trim().max(10).optional(),
});

export async function POST(request: Request) {
  const parsed = eventsRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid event lookup payload." }, { status: 400 });
  }

  const events = await getFishingEvents({
    country: parsed.data.country ?? null,
    city: parsed.data.city ?? null,
    lang: normalizeLanguage(parsed.data.lang),
  });

  return Response.json({ events });
}
