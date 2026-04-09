import { z } from "zod";
import { logger } from "./logger";

const geminiRecognitionSchema = z.object({
  species: z.string().min(1).max(60).nullable().optional(),
  lengthCm: z.number().int().min(5).max(250).nullable().optional(),
  weightKg: z.number().min(0.1).max(200).nullable().optional(),
  baitSuggestion: z.string().max(80).nullable().optional(),
  caption: z.string().max(180).nullable().optional(),
  confidence: z.number().int().min(0).max(100).nullable().optional(),
});

const geminiNearbyPlacesSchema = z.object({
  places: z
    .array(
      z.object({
        name: z.string().min(3).max(140),
        shortDescription: z.string().min(12).max(140),
        description: z.string().min(20).max(500),
        type: z.enum(["WILD", "PAYED", "CLUB", "SHOP"]),
        city: z.string().min(2).max(80),
        region: z.string().min(2).max(120),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        rating: z.number().min(1).max(5),
        depthMeters: z.number().min(0.2).max(100).nullable().optional(),
        fishSpecies: z.array(z.string().min(2).max(40)).max(6),
        amenities: z.array(z.string().min(2).max(40)).max(6),
        bestMonths: z.array(z.string().min(2).max(20)).max(6),
        sourceTitle: z.string().max(160).nullable().optional(),
        sourceUrl: z.string().url().nullable().optional(),
        imageUrl: z.string().url().nullable().optional(),
        aiSummary: z.string().max(220).nullable().optional(),
      }),
    )
    .max(8),
});

type GeminiGroundingChunk = {
  maps?: {
    title?: string;
    uri?: string;
    placeId?: string;
  };
  web?: {
    title?: string;
    uri?: string;
  };
};

export type RecognitionResult = {
  species: string | null;
  lengthCm: number | null;
  weightKg: number | null;
  baitSuggestion: string | null;
  caption: string | null;
  confidence: number;
  source: "gemini" | "fallback";
  note?: string;
};

export type NearbyAiPlace = {
  name: string;
  shortDescription: string;
  description: string;
  type: "WILD" | "PAYED" | "CLUB" | "SHOP";
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  rating: number;
  depthMeters: number | null;
  fishSpecies: string[];
  amenities: string[];
  bestMonths: string[];
  sourceUrl: string | null;
  imageUrl: string | null;
  aiSummary: string | null;
};

function hashText(value: string) {
  return [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function guessFromFileName(fileName: string): RecognitionResult {
  const normalized = fileName.toLowerCase();
  const speciesMatrix = [
    {
      keywords: ["щук", "pike"],
      species: "Щука",
      range: [52, 92] as const,
      baitSuggestion: "Минноу 110 или мягкий джиг",
    },
    {
      keywords: ["судак", "zander", "walleye"],
      species: "Судак",
      range: [45, 74] as const,
      baitSuggestion: "Джиг 14-22 г по бровке",
    },
    {
      keywords: ["окун", "perch"],
      species: "Окунь",
      range: [24, 38] as const,
      baitSuggestion: "Микроджиг или небольшой шэд",
    },
    {
      keywords: ["карп", "carp"],
      species: "Карп",
      range: [48, 82] as const,
      baitSuggestion: "Кукуруза, бойл или пеллетс",
    },
    {
      keywords: ["форел", "trout"],
      species: "Форель",
      range: [35, 58] as const,
      baitSuggestion: "Колебалка и ровная проводка",
    },
    {
      keywords: ["сом", "catfish"],
      species: "Сом",
      range: [60, 130] as const,
      baitSuggestion: "Объемная резина или живец",
    },
  ];

  const matched =
    speciesMatrix.find((item) => item.keywords.some((keyword) => normalized.includes(keyword))) ??
    {
      species: "Рыба",
      range: [35, 72] as const,
      baitSuggestion: "Проверь приманку вручную",
    };

  const seed = hashText(normalized || "fish");
  const lengthCm = matched.range[0] + (seed % (matched.range[1] - matched.range[0] + 1));
  const weightKg =
    matched.species === "Окунь"
      ? Number((0.3 + (seed % 7) * 0.1).toFixed(1))
      : Number((lengthCm * 0.055).toFixed(1));

  return {
    species: matched.species,
    lengthCm,
    weightKg,
    baitSuggestion: matched.baitSuggestion,
    caption:
      matched.species === "Рыба"
        ? "ИИ не смог надежно определить вид по фото. Проверь публикацию вручную."
        : `Похоже на ${matched.species.toLowerCase()} по локальной эвристике имени файла.`,
    confidence: matched.species === "Рыба" ? 18 : 41,
    source: "fallback",
    note: "Gemini недоступен, сработала локальная эвристика по имени файла.",
  };
}

function getGeminiConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview",
  };
}

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

function normalizeGroundingChunks(data: unknown) {
  const chunks =
    (
      data as {
        candidates?: Array<{
          groundingMetadata?: {
            groundingChunks?: GeminiGroundingChunk[];
          };
        }>;
      }
    )?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

  return chunks.filter((chunk) => chunk.maps?.uri || chunk.web?.uri);
}

function matchGroundedSource(
  chunks: GeminiGroundingChunk[],
  placeName: string,
  sourceTitle?: string | null,
) {
  const query = [sourceTitle, placeName].filter(Boolean).map((item) => item!.toLowerCase());

  for (const chunk of chunks) {
    const title = chunk.maps?.title ?? chunk.web?.title ?? "";
    const uri = chunk.maps?.uri ?? chunk.web?.uri ?? null;
    if (!uri) {
      continue;
    }

    const normalizedTitle = title.toLowerCase();
    if (query.some((item) => normalizedTitle.includes(item))) {
      return uri;
    }
  }

  return chunks[0]?.maps?.uri ?? chunks[0]?.web?.uri ?? null;
}

export async function recognizeCatch(input: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}): Promise<RecognitionResult> {
  const fallback = guessFromFileName(input.fileName);
  const { apiKey, model } = getGeminiConfig();

  if (!apiKey) {
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
                    "Определи рыбу на фото максимально осторожно и верни только JSON. " +
                    "Если уверенность низкая, укажи наиболее вероятный вид и confidence ниже 50. " +
                    "Оцени длину в сантиметрах, вес в килограммах, предложи короткую подпись и тип приманки.",
                },
                {
                  inlineData: {
                    mimeType: input.mimeType,
                    data: input.buffer.toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              properties: {
                species: { type: "string", description: "Название вида рыбы на русском языке." },
                lengthCm: { type: "integer", description: "Примерная длина рыбы в сантиметрах." },
                weightKg: { type: "number", description: "Примерный вес рыбы в килограммах." },
                baitSuggestion: {
                  type: "string",
                  description: "Короткая подсказка о подходящей приманке или типе снасти.",
                },
                caption: { type: "string", description: "Короткая подпись для публикации." },
                confidence: { type: "integer", description: "Уверенность модели от 0 до 100." },
              },
              required: ["species", "confidence"],
            },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with ${response.status}`);
    }

    const rawText = extractResponseText(await response.json());
    if (!rawText) {
      throw new Error("Gemini returned an empty body");
    }

    const parsed = geminiRecognitionSchema.parse(JSON.parse(rawText));

    return {
      species: parsed.species ?? fallback.species,
      lengthCm: parsed.lengthCm ?? fallback.lengthCm,
      weightKg: parsed.weightKg ?? fallback.weightKg,
      baitSuggestion: parsed.baitSuggestion ?? fallback.baitSuggestion,
      caption: parsed.caption ?? fallback.caption,
      confidence: parsed.confidence ?? 64,
      source: "gemini",
    };
  } catch {
    return {
      ...fallback,
      note: "Gemini не ответил вовремя. Проверь вид перед публикацией вручную.",
    };
  }
}

export async function discoverNearbyPlaces(input: {
  latitude: number;
  longitude: number;
  city?: string | null;
  region?: string | null;
  country?: string | null;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MAPS_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    return [] satisfies NearbyAiPlace[];
  }

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text:
                "Используй Google Maps Grounding и верни РЕАЛЬНЫЕ рыболовные места вокруг пользователя в формате JSON. " +
                'Схема: {"places":[{"name":"","shortDescription":"","description":"","type":"WILD|PAYED|CLUB|SHOP","city":"","region":"","latitude":0,"longitude":0,"rating":0,"depthMeters":null,"fishSpecies":[],"amenities":[],"bestMonths":[],"sourceTitle":"","sourceUrl":"","imageUrl":null, "aiSummary":""}]}. ' +
                "ТИП SHOP — ЭТО МАГАЗИНЫ! Нужны 4-6 точек: реки, базы ОБЯЗАТЕЛЬНО 1-2 МАГАЗИНА РЫБОЛОВНЫХ СНАСТЕЙ (fishing tackle shops, рыболовный магазин) поблизости. Если это магазин, ставь type: 'SHOP'. " +
                "Поле imageUrl всегда оставляй пустым (null). " +
                "Пиши текст на русском языке.",
            },
            {
              text: JSON.stringify({
                userLocation: {
                  latitude: input.latitude,
                  longitude: input.longitude,
                  city: input.city ?? null,
                  region: input.region ?? null,
                  country: input.country ?? null,
                },
                searchRadiusKm: 120,
              }),
            },
          ],
        },
      ],
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: input.latitude,
            longitude: input.longitude,
          },
        },
      },
      generationConfig: {
        temperature: 0.1,
      },
    };

    logger.info("AI", "Gemini discoverNearbyPlaces request", {
      model,
      input,
      body: requestBody,
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      },
    );

    const rawResponseText = await response.text();
    logger.info("AI", "Gemini discoverNearbyPlaces response", {
      status: response.status,
      statusText: response.statusText,
      body: rawResponseText,
    });

    if (!response.ok) {
      throw new Error(`Gemini place discovery failed with ${response.status}: ${rawResponseText}`);
    }

    const data = JSON.parse(rawResponseText);
    const rawText = extractResponseText(data);
    const jsonPayload = extractJsonPayload(rawText);
    if (!jsonPayload) {
      logger.warn("AI", "Gemini discoverNearbyPlaces empty json payload", { rawText });
      return [] satisfies NearbyAiPlace[];
    }

    const parsed = geminiNearbyPlacesSchema.parse(JSON.parse(jsonPayload));
    const groundingChunks = normalizeGroundingChunks(data);

    return parsed.places.map((place) => ({
      name: place.name,
      shortDescription: place.shortDescription,
      description: place.description,
      type: place.type,
      city: place.city,
      region: place.region,
      latitude: place.latitude,
      longitude: place.longitude,
      rating: Number(place.rating.toFixed(1)),
      depthMeters: place.depthMeters ?? null,
      fishSpecies: place.fishSpecies.length > 0 ? place.fishSpecies : ["Не указано"],
      amenities: place.amenities.length > 0 ? place.amenities : ["Без данных"],
      bestMonths: place.bestMonths.length > 0 ? place.bestMonths : ["Круглый год"],
      sourceUrl: place.sourceUrl ?? matchGroundedSource(groundingChunks, place.name, place.sourceTitle),
      imageUrl: place.imageUrl ?? null,
      aiSummary: place.aiSummary ?? null,
    }));
  } catch (error) {
    logger.error("AI", "Gemini discoverNearbyPlaces failed", error);
    return [] satisfies NearbyAiPlace[];
  }
}
