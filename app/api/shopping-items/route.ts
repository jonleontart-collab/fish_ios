import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

const createShoppingItemSchema = z.object({
  tripId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(180).optional(),
  quantity: z.coerce.number().int().min(1).max(20),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const parsed = createShoppingItemSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные покупки." },
      { status: 400 },
    );
  }

  if (parsed.data.tripId) {
    const trip = await prisma.trip.findFirst({
      where: {
        id: parsed.data.tripId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!trip) {
      return Response.json({ error: "Поездка не найдена." }, { status: 404 });
    }
  }

  const created = await prisma.shoppingItem.create({
    data: {
      userId: user.id,
      tripId: parsed.data.tripId || null,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      quantity: parsed.data.quantity,
    },
    select: {
      id: true,
    },
  });

  return Response.json(created, { status: 201 });
}
