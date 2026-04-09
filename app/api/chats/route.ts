import { z } from "zod";

import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { createChatSlug } from "@/lib/slug";
import { ensureSupportChatForUser } from "@/lib/support";

const chatSchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().max(180).optional(),
  visibility: z.enum(["OPEN", "PRIVATE"]),
  locationLabel: z.string().trim().max(80).optional(),
  inviteHandles: z.array(z.string().trim().min(2).max(40)).max(10).optional(),
});

const accentPalette = ["#69f0ae", "#87b8ff", "#ffb86b", "#f7d070", "#8fe4ff"];

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 401 });
  }

  await ensureSupportChatForUser(user.id);

  const chats = await prisma.chat.findMany({
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
              isSupport: true,
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
    take: 20,
  });

  return Response.json({ chats });
}

export async function POST(request: Request) {
  const parsed = chatSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные чата." },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const invitedUsers =
    parsed.data.inviteHandles && parsed.data.inviteHandles.length > 0
      ? await prisma.user.findMany({
          where: {
            handle: {
              in: parsed.data.inviteHandles.filter((handle) => handle !== user.handle),
            },
          },
          select: {
            id: true,
          },
        })
      : [];

  const slug = createChatSlug(parsed.data.title);
  const chat = await prisma.chat.create({
    data: {
      slug,
      ownerId: user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      accentColor: accentPalette[slug.length % accentPalette.length],
      visibility: parsed.data.visibility,
      locationLabel: parsed.data.locationLabel || null,
      members: {
        create: [
          { userId: user.id },
          ...invitedUsers.map((invitedUser) => ({
            userId: invitedUser.id,
          })),
        ],
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  return Response.json(chat, { status: 201 });
}
