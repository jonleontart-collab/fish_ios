import { z } from "zod";

import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveMediaFile } from "@/lib/storage";

const messageSchema = z.object({
  body: z.string().trim().max(700).optional().default(""),
});

function getMediaType(file: File) {
  if (file.type.startsWith("image/")) {
    return "IMAGE" as const;
  }

  if (file.type.startsWith("video/")) {
    return "VIDEO" as const;
  }

  return null;
}

async function ensureMembership(chatId: string, userId: string) {
  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId,
      },
    },
  });

  return membership;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ chatId: string }>;
  },
) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 401 });
  }

  const { chatId } = await context.params;
  const membership = await ensureMembership(chatId, user.id);

  if (!membership) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
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
    orderBy: {
      createdAt: "asc",
    },
    take: 160,
  });

  return Response.json({ messages });
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ chatId: string }>;
  },
) {
  const { chatId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 401 });
  }

  const membership = await ensureMembership(chatId, user.id);

  if (!membership) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  let body = "";
  let file: File | null = null;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    body = String(formData.get("body") ?? "");
    const media = formData.get("media");
    file = media instanceof File && media.size > 0 ? media : null;
  } else {
    const payload = await request.json();
    const parsed = messageSchema.safeParse(payload);

    if (!parsed.success) {
      return Response.json({ error: "Invalid message." }, { status: 400 });
    }

    body = parsed.data.body;
  }

  const parsed = messageSchema.safeParse({ body });

  if (!parsed.success) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }

  const mediaType = file ? getMediaType(file) : null;

  if (!parsed.data.body.trim() && !file) {
    return Response.json({ error: "Message is empty." }, { status: 400 });
  }

  if (file && !mediaType) {
    return Response.json({ error: "Unsupported media type." }, { status: 400 });
  }

  const savedFile = file ? await saveMediaFile(file) : null;

  const message = await prisma.message.create({
    data: {
      chatId,
      userId: user.id,
      body: parsed.data.body.trim(),
      mediaPath: savedFile?.publicPath ?? null,
      mediaType,
    },
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
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: {
      updatedAt: new Date(),
    },
  });

  return Response.json(message, { status: 201 });
}
