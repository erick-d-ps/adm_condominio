import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { getCurrentAppUser } from "@/lib/auth/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const maxPhotoSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const requestHost = (forwardedHost ?? request.headers.get("host"))?.split(",")[0]?.trim();

  if (!origin || !requestHost) return Response.json({ error: "Origin required" }, { status: 403 });

  try {
    if (new URL(origin).host !== requestHost) {
      return Response.json({ error: "Cross-origin request denied" }, { status: 403 });
    }
  } catch {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const rawContentLength = request.headers.get("content-length");
  const contentLength = Number(rawContentLength);
  if (!rawContentLength || !Number.isFinite(contentLength) || contentLength > maxPhotoSize + 64 * 1024) {
    return Response.json({ error: "Image exceeds 5 MB" }, { status: 413 });
  }

  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!user || !supabase || !admin) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id: rawId } = await params;
  const occurrenceId = Number(rawId);
  if (!Number.isSafeInteger(occurrenceId) || occurrenceId < 1) {
    return Response.json({ error: "Occurrence not found" }, { status: 404 });
  }

  const { data: occurrence, error: occurrenceError } = await supabase
    .from("occurrences")
    .select("id")
    .eq("id", occurrenceId)
    .eq("author_profile_id", user.id)
    .eq("status", "pending")
    .is("deleted_at", null)
    .maybeSingle();

  if (occurrenceError || !occurrence) {
    return Response.json({ error: "Occurrence not available for editing" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > maxPhotoSize) {
    return Response.json({ error: "Image must be between 1 byte and 5 MB" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detectedType = await fileTypeFromBuffer(bytes);
  if (!detectedType || !allowedImageTypes.has(detectedType.mime)) {
    return Response.json({ error: "Unsupported image format" }, { status: 415 });
  }

  const bucketError = await ensureOccurrencePhotoBucket(admin);
  if (bucketError) {
    console.error("Occurrence photo bucket unavailable:", bucketError);
    return Response.json({ error: "Image upload failed" }, { status: 502 });
  }

  const storagePath = `${occurrenceId}/${randomUUID()}.${detectedType.ext}`;
  const { error: uploadError } = await admin.storage
    .from("occurrence-photos")
    .upload(storagePath, bytes, { contentType: detectedType.mime, upsert: false });

  if (uploadError) {
    console.error("Occurrence photo upload failed:", uploadError.message);
    return Response.json({ error: "Image upload failed" }, { status: 502 });
  }

  const { error: metadataError } = await admin.from("occurrence_photos").insert({
    occurrence_id: occurrenceId,
    storage_path: storagePath,
    mime_type: detectedType.mime,
    size_bytes: file.size,
  });

  if (metadataError) {
    await admin.storage.from("occurrence-photos").remove([storagePath]);
    return Response.json({ error: "Photo could not be associated with occurrence" }, { status: 400 });
  }

  return Response.json({ success: true });
}

async function ensureOccurrencePhotoBucket(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>) {
  const existing = await admin.storage.getBucket("occurrence-photos");
  if (!existing.error && existing.data) return null;

  const { error } = await admin.storage.createBucket("occurrence-photos", {
    public: false,
    fileSizeLimit: maxPhotoSize,
    allowedMimeTypes: [...allowedImageTypes],
  });

  if (!error || error.message.toLowerCase().includes("already exists")) return null;
  return error.message;
}