import { readStoredImage } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ name: string }>;
  },
) {
  const { name } = await context.params;

  try {
    const file = await readStoredImage(name);

    return new Response(file.buffer, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.json({ error: "Файл не найден." }, { status: 404 });
  }
}
