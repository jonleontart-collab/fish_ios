import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(700),
});

export async function POST(
  request: Request,
  context: {
    params: Promise<{ chatId: string }>;
  },
) {
  const { chatId } = await context.params;
  const payload = await request.json();
  const parsed = messageSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json({ error: "Некорректное сообщение." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    return Response.json({ error: "Нет доступа к чату." }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      userId: user.id,
      body: parsed.data.body,
    },
    select: {
      id: true,
    },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: {
      updatedAt: new Date(),
    },
  });

  return Response.json(message, { status: 201 });
}
