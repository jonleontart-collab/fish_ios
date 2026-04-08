import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ catchId: string }>;
  },
) {
  const { catchId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const catchItem = await prisma.catch.findUnique({
    where: {
      id: catchId,
    },
    select: {
      id: true,
    },
  });

  if (!catchItem) {
    return Response.json({ error: "Публикация не найдена." }, { status: 404 });
  }

  const existing = await prisma.catchLike.findUnique({
    where: {
      catchId_userId: {
        catchId,
        userId: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    await prisma.catchLike.delete({
      where: {
        catchId_userId: {
          catchId,
          userId: user.id,
        },
      },
    });
  } else {
    await prisma.catchLike.create({
      data: {
        catchId,
        userId: user.id,
      },
    });
  }

  const likesCount = await prisma.catchLike.count({
    where: {
      catchId,
    },
  });

  await prisma.catch.update({
    where: {
      id: catchId,
    },
    data: {
      likesCount,
    },
  });

  return Response.json({
    liked: !existing,
    likesCount,
  });
}
