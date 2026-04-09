import { prisma } from "@/lib/prisma";

export async function getFriendsForUser(userId: string) {
  const rows = await prisma.userFriend.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ userId }, { friendId: userId }],
    },
    include: {
      user: true,
      friend: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const seen = new Set<string>();

  return rows
    .map((row) => (row.userId === userId ? row.friend : row.user))
    .filter((friend) => {
      if (seen.has(friend.id)) {
        return false;
      }

      seen.add(friend.id);
      return true;
    });
}

export async function areFriends(userId: string, otherUserId: string) {
  const relationship = await prisma.userFriend.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { userId, friendId: otherUserId },
        { userId: otherUserId, friendId: userId },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(relationship);
}

export async function toggleFriendship(userId: string, otherUserId: string) {
  const existing = await prisma.userFriend.findFirst({
    where: {
      OR: [
        { userId, friendId: otherUserId },
        { userId: otherUserId, friendId: userId },
      ],
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    await prisma.userFriend.deleteMany({
      where: {
        OR: [
          { userId, friendId: otherUserId },
          { userId: otherUserId, friendId: userId },
        ],
      },
    });

    return { isFriend: false };
  }

  await prisma.$transaction([
    prisma.userFriend.create({
      data: {
        userId,
        friendId: otherUserId,
        status: "ACCEPTED",
      },
    }),
    prisma.userFriend.create({
      data: {
        userId: otherUserId,
        friendId: userId,
        status: "ACCEPTED",
      },
    }),
  ]);

  return { isFriend: true };
}

export async function getOrCreateDirectChat(userId: string, otherUserId: string) {
  const existing = await prisma.chat.findMany({
    where: {
      visibility: "PRIVATE",
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const directChat = existing.find((chat) => {
    const memberIds = chat.members.map((member) => member.userId);
    return memberIds.length === 2 && memberIds.includes(otherUserId);
  });

  if (directChat) {
    return directChat;
  }

  const [leftId, rightId] = [userId, otherUserId].sort();

  try {
    return await prisma.chat.create({
      data: {
        slug: `dm-${leftId.slice(-6)}-${rightId.slice(-6)}`,
        ownerId: userId,
        title: "Direct chat",
        accentColor: "#67E8B2",
        visibility: "PRIVATE",
        members: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
    });
  } catch {
    const fallback = await prisma.chat.findFirst({
      where: {
        visibility: "PRIVATE",
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (fallback && fallback.members.some((member) => member.userId === otherUserId)) {
      return fallback;
    }

    throw new Error("Could not create direct chat.");
  }
}
