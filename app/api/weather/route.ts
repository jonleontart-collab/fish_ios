import { z } from "zod";
import { getPlaceWeather } from "@/lib/weather";

const weatherQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  name: z.string().trim().max(120).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = weatherQuerySchema.safeParse({
    latitude: searchParams.get("latitude"),
    longitude: searchParams.get("longitude"),
    name: searchParams.get("name") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные координаты погоды." },
      { status: 400 },
    );
  }

  const weather = await getPlaceWeather({
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    name: parsed.data.name ?? "Current location",
  });

  return Response.json(weather);
}
