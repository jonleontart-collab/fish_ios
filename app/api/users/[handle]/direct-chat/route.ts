import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getOrCreateDirectChat } from "@/lib/social";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ handle: string }>;
  },
) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 401 });
  }

  const { handle } = await context.params;
  const target = await prisma.user.findUnique({
    where: { handle },
    select: { id: true, handle: true },
  });

  if (!target || target.id === user.id) {
    return Response.json({ error: "Target user not found." }, { status: 404 });
  }

  const chat = await getOrCreateDirectChat(user.id, target.id);

  return Response.json({
    id: chat.id,
    slug: chat.slug,
  });
}
