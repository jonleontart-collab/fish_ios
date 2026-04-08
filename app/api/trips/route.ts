import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

const createTripSchema = z.object({
  placeId: z.string().trim().min(1),
  title: z.string().trim().min(3).max(120),
  notes: z.string().trim().max(500).optional(),
  goals: z.string().trim().max(500).optional(),
  startAt: z.string().datetime(),
});

export async function POST(request: Request) {
  const parsed = createTripSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные поездки." },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const place = await prisma.place.findUnique({
    where: { id: parsed.data.placeId },
    select: { id: true },
  });

  if (!place) {
    return Response.json({ error: "Место не найдено." }, { status: 404 });
  }

  const created = await prisma.trip.create({
    data: {
      userId: user.id,
      placeId: parsed.data.placeId,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      goals: parsed.data.goals || null,
      startAt: new Date(parsed.data.startAt),
      status: "PLANNED",
    },
    select: {
      id: true,
    },
  });

  return Response.json(created, { status: 201 });
}
