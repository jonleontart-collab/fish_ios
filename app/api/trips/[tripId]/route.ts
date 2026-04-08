import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/storage";

const updateTripSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  goals: z.string().trim().max(500).optional(),
  summary: z.string().trim().max(1000).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  status: z.enum(["PLANNED", "CONFIRMED", "COMPLETED"]).optional(),
  publish: z.enum(["true", "false"]).optional(),
});

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ tripId: string }>;
  },
) {
  const { tripId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      userId: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!trip) {
    return Response.json({ error: "Поездка не найдена." }, { status: 404 });
  }

  if (trip.userId !== user.id) {
    return Response.json({ error: "Нет доступа к редактированию поездки." }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = updateTripSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes"),
    goals: formData.get("goals"),
    summary: formData.get("summary"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    status: formData.get("status"),
    publish: formData.get("publish"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные поездки." },
      { status: 400 },
    );
  }

  const reportImage = formData.get("reportImage");
  const storedImage =
    reportImage instanceof File && reportImage.size > 0 ? await saveImageFile(reportImage) : null;
  const publishValue = parsed.data.publish;
  const shouldPublish = publishValue === "true";
  const nextStatus = parsed.data.status;
  const effectiveStatus = nextStatus ?? trip.status;

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: {
      title: parsed.data.title,
      notes: parsed.data.notes || undefined,
      goals: parsed.data.goals || undefined,
      summary: parsed.data.summary || undefined,
      startAt: parsed.data.startAt ? new Date(parsed.data.startAt) : undefined,
      endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : undefined,
      status: nextStatus,
      reportImagePath: storedImage?.publicPath ?? undefined,
      publishedAt:
        publishValue === undefined
          ? undefined
          : shouldPublish && effectiveStatus === "COMPLETED"
            ? trip.publishedAt ?? new Date()
            : shouldPublish
              ? trip.publishedAt
              : null,
    },
    select: {
      id: true,
      status: true,
      publishedAt: true,
    },
  });

  return Response.json(updated);
}
