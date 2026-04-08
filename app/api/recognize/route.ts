import { MAX_AI_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { recognizeCatch } from "@/lib/ai";

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return Response.json({ error: "Файл изображения не передан." }, { status: 400 });
  }

  if (image.size > MAX_AI_IMAGE_SIZE_BYTES) {
    return Response.json({ error: "Файл слишком большой для ИИ-анализа." }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const result = await recognizeCatch({
    buffer,
    mimeType: image.type || "image/jpeg",
    fileName: image.name || "catch.jpg",
  });

  return Response.json(result);
}
