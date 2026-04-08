import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/storage";

const createInventoryItemSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(40),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1).max(20)
  ),
  notes: z.string().trim().max(180).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const formData = await request.formData();
  
  const parsed = createInventoryItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные инвентаря." },
      { status: 400 },
    );
  }

  const file = formData.get("image");
  const upload = file instanceof File && file.size > 0 ? await saveImageFile(file) : null;

  const created = await prisma.inventoryItem.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      category: parsed.data.category,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes || null,
      imagePath: upload?.publicPath || null,
    },
    select: {
      id: true,
    },
  });

  return Response.json(created, { status: 201 });
}
