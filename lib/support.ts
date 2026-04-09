import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPPORT_HANDLE = "fishflow_support";
const SUPPORT_PASSWORD = process.env.SUPPORT_PASSWORD ?? "support12345";

export async function ensureSupportUser() {
  const existing = await prisma.user.findUnique({
    where: { handle: SUPPORT_HANDLE },
  });

  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: {
      name: "FishFlow Support",
      firstName: "FishFlow",
      lastName: "Support",
      handle: SUPPORT_HANDLE,
      preferredLanguage: "ru",
      bio: "Support channel for account, billing, safety, and app questions.",
      city: "Belgrade",
      passwordHash: hashPassword(SUPPORT_PASSWORD),
      avatarGradient: "from-[#78f0c5] via-[#56d1db] to-[#67a5ff]",
      isSupport: true,
    },
  });
}

export async function ensureSupportChatForUser(userId: string) {
  const supportUser = await ensureSupportUser();

  if (supportUser.id === userId) {
    return null;
  }

  const existing = await prisma.chat.findFirst({
    where: {
      isSystem: true,
      ownerId: supportUser.id,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: true,
    },
  });

  if (existing && existing.members.some((member) => member.userId === supportUser.id)) {
    return existing;
  }

  return prisma.chat.create({
    data: {
      slug: `support-${userId.slice(-10)}`,
      ownerId: supportUser.id,
      title: "FishFlow Support",
      description: "Questions about account, moderation, trips, or maps.",
      accentColor: "#67E8B2",
      visibility: "PRIVATE",
      isSystem: true,
      members: {
        create: [{ userId }, { userId: supportUser.id }],
      },
      messages: {
        create: {
          userId: supportUser.id,
          body: "Напишите сюда, если нужна помощь по аккаунту, карте, поездкам, оплатам или модерации.",
        },
      },
    },
    include: {
      members: true,
    },
  });
}

export function isSupportHandle(handle: string) {
  return handle === SUPPORT_HANDLE;
}

export function getSupportCredentialsNote() {
  return {
    handle: SUPPORT_HANDLE,
    password: SUPPORT_PASSWORD,
  };
}
