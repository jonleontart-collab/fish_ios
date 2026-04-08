import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ chatId: string }>;
  },
) {
  const { chatId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      visibility: true,
      slug: true,
    },
  });

  if (!chat) {
    return Response.json({ error: "Чат не найден." }, { status: 404 });
  }

  if (chat.visibility !== "OPEN") {
    return Response.json({ error: "Этот чат закрыт для свободного входа." }, { status: 403 });
  }

  await prisma.chatMember.upsert({
    where: {
      chatId_userId: {
        chatId,
        userId: user.id,
      },
    },
    create: {
      chatId,
      userId: user.id,
    },
    update: {},
  });

  return Response.json({ slug: chat.slug });
}
