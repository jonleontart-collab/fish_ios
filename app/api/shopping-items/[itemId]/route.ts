import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

const updateShoppingStatusSchema = z.object({
  status: z.enum(["PLANNED", "BOUGHT"]),
});

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ itemId: string }>;
  },
) {
  const { itemId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const parsed = updateShoppingStatusSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректный статус покупки." },
      { status: 400 },
    );
  }

  const item = await prisma.shoppingItem.findUnique({
    where: {
      id: itemId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!item) {
    return Response.json({ error: "Покупка не найдена." }, { status: 404 });
  }

  if (item.userId !== user.id) {
    return Response.json({ error: "Нет доступа к обновлению покупки." }, { status: 403 });
  }

  const updated = await prisma.shoppingItem.update({
    where: {
      id: itemId,
    },
    data: {
      status: parsed.data.status,
    },
    select: {
      id: true,
      status: true,
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ itemId: string }>;
  },
) {
  const { itemId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const item = await prisma.shoppingItem.findUnique({
    where: {
      id: itemId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!item) {
    return Response.json({ error: "Покупка не найдена." }, { status: 404 });
  }

  if (item.userId !== user.id) {
    return Response.json({ error: "Нет доступа к удалению покупки." }, { status: 403 });
  }

  await prisma.shoppingItem.delete({
    where: {
      id: itemId,
    },
  });

  return Response.json({ ok: true });
}
