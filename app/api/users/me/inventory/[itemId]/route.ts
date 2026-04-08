import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

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

  const item = await prisma.inventoryItem.findUnique({
    where: {
      id: itemId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!item) {
    return Response.json({ error: "Предмет не найден." }, { status: 404 });
  }

  if (item.userId !== user.id) {
    return Response.json({ error: "Нет доступа к удалению предмета." }, { status: 403 });
  }

  await prisma.inventoryItem.delete({
    where: {
      id: itemId,
    },
  });

  return Response.json({ ok: true });
}
