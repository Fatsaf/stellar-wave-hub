import { getAuthUser } from "@/lib/auth";
import { getSupabase } from "@/lib/firebase";
import { parseBody } from "@/lib/validation/parse-body";
import { uploadFormSchema } from "@/lib/validation/schemas/upload";

export const dynamic = "force-dynamic";

const BUCKET = "research-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const auth = getAuthUser(request);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const parsed = parseBody(uploadFormSchema, {
      files: formData.getAll("files"),
    });
    if (!parsed.success) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const { files } = parsed.data;
    const supabase = getSupabase();

    // Ensure bucket exists (idempotent)
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });

    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop() || "png";
      const path = `${auth.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return Response.json(
          { error: `Upload failed: ${error.message}` },
          { status: 500 },
        );
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      urls.push(urlData.publicUrl);
    }

    return Response.json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
