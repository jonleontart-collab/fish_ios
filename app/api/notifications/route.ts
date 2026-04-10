import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getIncomingFriendRequests } from "@/lib/social";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 401 });
  }

  const [friendRequests, chats] = await Promise.all([
    getIncomingFriendRequests(user.id),
    prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
                avatarPath: true,
                avatarGradient: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
              },
            },
          },
        },
      },
      orderBy: [{ isSystem: "desc" }, { updatedAt: "desc" }],
      take: 6,
    }),
  ]);

  return Response.json({
    friendRequests: friendRequests.map((request) => ({
      id: request.id,
      createdAt: request.createdAt,
      user: request.user,
    })),
    chats,
  });
}
