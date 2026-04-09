import { z } from "zod";

import { type LanguageCode } from "@/lib/i18n";
import { logger } from "@/lib/logger";

export type FishingEvent = {
  id: string;
  title: string;
  city: string;
  country: string;
  venue: string | null;
  startsAt: string;
  endsAt: string | null;
  summary: string;
  sourceUrl: string | null;
  type: "expo" | "tournament" | "festival" | "meetup";
  source: "gemini" | "fallback";
};

const geminiFishingEventsSchema = z.object({
  events: z
    .array(
      z.object({
        title: z.string().min(3).max(160),
        city: z.string().min(2).max(80),
        country: z.string().min(2).max(80),
        venue: z.string().max(140).nullable().optional(),
        startsAt: z.string().min(8).max(40),
        endsAt: z.string().min(8).max(40).nullable().optional(),
        summary: z.string().min(12).max(260),
        sourceUrl: z.string().url().nullable().optional(),
        type: z.enum(["expo", "tournament", "festival", "meetup"]),
      }),
    )
    .max(8),
});

const promptLanguages: Record<LanguageCode, string> = {
  ru: "Russian",
  en: "English",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
};

function extractResponseText(data: unknown) {
  const candidate = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    ?.candidates?.[0];

  return (
    candidate?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

function extractJsonPayload(rawText: string) {
  if (!rawText) {
    return null;
  }

  const fenced = rawText.match(/```json\s*([\s\S]*?)```/i) ?? rawText.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const objectStart = rawText.indexOf("{");
  const objectEnd = rawText.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    return rawText.slice(objectStart, objectEnd + 1);
  }

  return rawText.trim();
}

function normalizeEventDate(input: string) {
  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return `${input}T10:00:00.000Z`;
  }

  return null;
}

function buildFallbackEvents({
  country,
  city,
}: {
  country?: string | null;
  city?: string | null;
}): FishingEvent[] {
  const baseCity = city || "Capital";
  const baseCountry = country || "your country";
  const now = new Date();

  const events: FishingEvent[] = [
    {
      id: `fallback-${baseCountry}-expo`,
      title: `${baseCountry} Fishing Expo`,
      city: baseCity,
      country: baseCountry,
      venue: "Main expo hall",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12, 10, 0).toISOString(),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 13, 18, 0).toISOString(),
      summary: "Large tackle brands, sonar demos, and open talks with guides and tournament captains.",
      sourceUrl: null,
      type: "expo",
      source: "fallback",
    },
    {
      id: `fallback-${baseCountry}-cup`,
      title: `${baseCountry} River Cup`,
      city: baseCity,
      country: baseCountry,
      venue: "Riverside launch zone",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21, 6, 30).toISOString(),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21, 17, 0).toISOString(),
      summary: "One-day predator tournament with shore and boat divisions, weigh-in, and evening recap.",
      sourceUrl: null,
      type: "tournament",
      source: "fallback",
    },
    {
      id: `fallback-${baseCountry}-festival`,
      title: `${baseCountry} Anglers Weekend`,
      city: baseCity,
      country: baseCountry,
      venue: "Lakeside camp",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 36, 9, 0).toISOString(),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 37, 16, 0).toISOString(),
      summary: "Family-friendly festival with casting zones, feeder workshops, and local club meetups.",
      sourceUrl: null,
      type: "festival",
      source: "fallback",
    },
    {
      id: `fallback-${baseCountry}-meetup`,
      title: `${baseCountry} Boat Electronics Meetup`,
      city: baseCity,
      country: baseCountry,
      venue: "Tackle center",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 48, 18, 30).toISOString(),
      endsAt: null,
      summary: "Short evening meetup about sonar settings, structure scanning, and route planning on the water.",
      sourceUrl: null,
      type: "meetup",
      source: "fallback",
    },
  ];

  return events.sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());
}

export async function getFishingEvents(input: {
  country?: string | null;
  city?: string | null;
  lang: LanguageCode;
}) {
  const fallback = buildFallbackEvents(input);
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";

  if (!apiKey || !input.country) {
    return fallback;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Return only JSON with upcoming public fishing events for the next 120 days. " +
                    "Focus on expos, tournaments, festivals, and meetups. " +
                    `Write all text in ${promptLanguages[input.lang]}. ` +
                    "If you are unsure, return fewer events instead of inventing details. " +
                    'Schema: {"events":[{"title":"","city":"","country":"","venue":null,"startsAt":"","endsAt":null,"summary":"","sourceUrl":null,"type":"expo|tournament|festival|meetup"}]}.',
                },
                {
                  text: JSON.stringify({
                    today: new Date().toISOString(),
                    country: input.country,
                    city: input.city ?? null,
                    limit: 8,
                  }),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini events request failed with ${response.status}`);
    }

    const rawText = extractResponseText(await response.json());
    const jsonPayload = extractJsonPayload(rawText);

    if (!jsonPayload) {
      throw new Error("Gemini events returned an empty body");
    }

    const parsed = geminiFishingEventsSchema.parse(JSON.parse(jsonPayload));
    const events = parsed.events
      .map((event, index) => {
        const startsAt = normalizeEventDate(event.startsAt);
        const endsAt = event.endsAt ? normalizeEventDate(event.endsAt) : null;

        if (!startsAt) {
          return null;
        }

        return {
          id: `gemini-${index}-${event.title.toLowerCase().replace(/\s+/g, "-")}`,
          title: event.title,
          city: event.city,
          country: event.country,
          venue: event.venue ?? null,
          startsAt,
          endsAt,
          summary: event.summary,
          sourceUrl: event.sourceUrl ?? null,
          type: event.type,
          source: "gemini" as const,
        };
      })
      .filter((event): event is NonNullable<typeof event> => event !== null)
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());

    return events.length > 0 ? events : fallback;
  } catch (error) {
    logger.warn("Events", "Gemini events fallback", error);
    return fallback;
  }
}
