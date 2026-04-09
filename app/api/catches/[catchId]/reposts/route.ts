import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ catchId: string }>;
  },
) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 401 });
  }

  const { catchId } = await context.params;
  const catchItem = await prisma.catch.findUnique({
    where: { id: catchId },
    select: { id: true },
  });

  if (!catchItem) {
    return Response.json({ error: "Catch not found." }, { status: 404 });
  }

  const existing = await prisma.catchRepost.findUnique({
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
    await prisma.catchRepost.delete({
      where: {
        catchId_userId: {
          catchId,
          userId: user.id,
        },
      },
    });
  } else {
    await prisma.catchRepost.create({
      data: {
        catchId,
        userId: user.id,
      },
    });
  }

  const repostsCount = await prisma.catchRepost.count({
    where: {
      catchId,
    },
  });

  return Response.json({
    reposted: !existing,
    repostsCount,
  });
}
