import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getFriendsForUser, getIncomingFriendRequests, updateFriendship } from "@/lib/social";

type FriendAction = "request" | "cancel" | "remove" | "accept" | "decline";

export async function POST(
  request: Request,
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

  const payload = (await request.json().catch(() => null)) as { action?: FriendAction } | null;
  const action = payload?.action ?? "request";
  const result = await updateFriendship(user.id, target.id, action);
  const [friends, incomingRequests] = await Promise.all([
    getFriendsForUser(user.id),
    getIncomingFriendRequests(user.id),
  ]);

  return Response.json({
    ...result,
    friendsCount: friends.length,
    incomingRequestsCount: incomingRequests.length,
  });
}
