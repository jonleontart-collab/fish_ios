import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({
  body: z.string().trim().min(1).max(500),
});

export async function POST(
  request: Request,
  context: {
    params: Promise<{ catchId: string }>;
  },
) {
  const { catchId } = await context.params;
  const parsed = commentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Комментарий не прошел валидацию." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const catchItem = await prisma.catch.findUnique({
    where: { id: catchId },
    select: { id: true },
  });

  if (!catchItem) {
    return Response.json({ error: "Публикация не найдена." }, { status: 404 });
  }

  const comment = await prisma.catchComment.create({
    data: {
      catchId,
      userId: user.id,
      body: parsed.data.body,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          handle: true,
          avatarGradient: true,
        },
      },
    },
  });

  return Response.json(comment, { status: 201 });
}
