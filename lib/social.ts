import { prisma } from "@/lib/prisma";

export type FriendRelationship = "none" | "outgoing" | "incoming" | "accepted";

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

export async function getIncomingFriendRequests(userId: string) {
  return prisma.userFriend.findMany({
    where: {
      friendId: userId,
      status: "PENDING",
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOutgoingFriendRequests(userId: string) {
  return prisma.userFriend.findMany({
    where: {
      userId,
      status: "PENDING",
    },
    include: {
      friend: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFriendRelationship(userId: string, otherUserId: string): Promise<FriendRelationship> {
  const rows = await prisma.userFriend.findMany({
    where: {
      OR: [
        { userId, friendId: otherUserId },
        { userId: otherUserId, friendId: userId },
      ],
    },
    select: {
      userId: true,
      friendId: true,
      status: true,
    },
  });

  if (rows.some((row) => row.status === "ACCEPTED")) {
    return "accepted";
  }

  if (rows.some((row) => row.userId === userId && row.friendId === otherUserId && row.status === "PENDING")) {
    return "outgoing";
  }

  if (rows.some((row) => row.userId === otherUserId && row.friendId === userId && row.status === "PENDING")) {
    return "incoming";
  }

  return "none";
}

export async function areFriends(userId: string, otherUserId: string) {
  const relationship = await getFriendRelationship(userId, otherUserId);
  return relationship === "accepted";
}

export async function updateFriendship(
  userId: string,
  otherUserId: string,
  action: "request" | "cancel" | "remove" | "accept" | "decline",
) {
  const current = await getFriendRelationship(userId, otherUserId);

  if (action === "request") {
    if (current === "accepted") {
      return { relationship: "accepted" as const };
    }

    if (current === "incoming") {
      await prisma.userFriend.updateMany({
        where: {
          OR: [
            { userId: otherUserId, friendId: userId, status: "PENDING" },
            { userId, friendId: otherUserId, status: "PENDING" },
          ],
        },
        data: {
          status: "ACCEPTED",
        },
      });

      return { relationship: "accepted" as const };
    }

    if (current === "outgoing") {
      return { relationship: "outgoing" as const };
    }

    await prisma.userFriend.create({
      data: {
        userId,
        friendId: otherUserId,
        status: "PENDING",
      },
    });

    return { relationship: "outgoing" as const };
  }

  if (action === "cancel") {
    await prisma.userFriend.deleteMany({
      where: {
        userId,
        friendId: otherUserId,
        status: "PENDING",
      },
    });

    return { relationship: "none" as const };
  }

  if (action === "decline") {
    await prisma.userFriend.deleteMany({
      where: {
        userId: otherUserId,
        friendId: userId,
        status: "PENDING",
      },
    });

    return { relationship: "none" as const };
  }

  if (action === "accept") {
    await prisma.userFriend.updateMany({
      where: {
        OR: [
          { userId: otherUserId, friendId: userId, status: "PENDING" },
          { userId, friendId: otherUserId, status: "PENDING" },
        ],
      },
      data: {
        status: "ACCEPTED",
      },
    });

    return { relationship: "accepted" as const };
  }

  await prisma.userFriend.deleteMany({
    where: {
      OR: [
        { userId, friendId: otherUserId },
        { userId: otherUserId, friendId: userId },
      ],
    },
  });

  return { relationship: "none" as const };
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
