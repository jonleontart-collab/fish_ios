import { z } from "zod";

const ipLookupSchema = z.object({
  success: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

function parseForwardedIp(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export async function GET(request: Request) {
  const headers = request.headers;
  const edgeLatitude = headers.get("x-vercel-ip-latitude");
  const edgeLongitude = headers.get("x-vercel-ip-longitude");

  if (edgeLatitude && edgeLongitude) {
    return Response.json({
      latitude: Number(edgeLatitude),
      longitude: Number(edgeLongitude),
      city: headers.get("x-vercel-ip-city"),
      region: headers.get("x-vercel-ip-country-region"),
      country: headers.get("x-vercel-ip-country"),
      source: "ip",
    });
  }

  const ip =
    parseForwardedIp(headers.get("x-forwarded-for")) ||
    headers.get("x-real-ip") ||
    new URL(request.url).searchParams.get("ip");

  try {
    const endpoint = ip ? `https://ipwho.is/${ip}` : "https://ipwho.is/";
    const response = await fetch(endpoint, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`IP lookup failed with ${response.status}`);
    }

    const parsed = ipLookupSchema.parse(await response.json());
    if (typeof parsed.latitude !== "number" || typeof parsed.longitude !== "number") {
      throw new Error("Missing coordinates");
    }

    return Response.json({
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      city: parsed.city ?? null,
      region: parsed.region ?? null,
      country: parsed.country ?? null,
      source: "ip",
    });
  } catch {
    return Response.json(
      {
        error: "Не удалось определить местоположение по IP.",
      },
      { status: 502 },
    );
  }
}
