import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "@/lib/api-helpers";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ error: "Almacenamiento en la nube no configurado" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Archivo demasiado grande (máx. 8MB)" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG, WebP o GIF" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: `campaign-forge/${folder}`,
      resource_type: "image",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Error al subir el archivo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
