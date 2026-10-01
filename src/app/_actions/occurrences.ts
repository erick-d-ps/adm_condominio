"use server";

import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateOccurrenceSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10000),
  category: z.enum(["maintenance", "noise", "cleaning", "other"]),
  location: z.string().trim().min(1).max(200),
});

const occurrenceIdSchema = z.object({ id: z.number().int().positive() });
const commentIdSchema = z.object({ id: z.number().int().positive() });
const commentSchema = z.object({
  occurrenceId: z.number().int().positive(),
  body: z.string().trim().min(1).max(5000),
});
const advanceSchema = z.object({
  occurrenceId: z.number().int().positive(),
  expectedStatus: z.enum(["pending", "in_review"]),
});

export type OccurrenceActionResult = {
  success: boolean;
  message?: string;
};

export async function updateOccurrence(
  input: unknown
): Promise<OccurrenceActionResult> {
  const parsed = updateOccurrenceSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Revise os campos obrigatórios." };

  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase)
    return { success: false, message: "Sua sessão expirou." };

  const { id, ...changes } = parsed.data;
  const { data, error } = await supabase
    .from("occurrences")
    .update(changes)
    .eq("id", id)
    .eq("author_profile_id", user.id)
    .eq("status", "pending")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      message: "Só o autor pode editar uma ocorrência pendente.",
    };
  }

  return { success: true };
}

export async function advanceOccurrenceStatus(
  input: unknown
): Promise<OccurrenceActionResult> {
  const parsed = advanceSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Transição de status inválida." };

  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  if (!user || user.role !== "employee" || !supabase) {
    return {
      success: false,
      message: "Somente funcionários podem avançar o status.",
    };
  }

  const { data, error } = await supabase.rpc("advance_occurrence_status", {
    p_occurrence_id: parsed.data.occurrenceId,
    p_expected_status: parsed.data.expectedStatus,
  });

  if (error || !data) {
    return {
      success: false,
      message: "O status mudou ou a ocorrência já foi resolvida.",
    };
  }

  return { success: true };
}

export async function softDeleteOccurrence(
  input: unknown
): Promise<OccurrenceActionResult> {
  const parsed = occurrenceIdSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Ocorrência inválida." };

  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!user || !supabase || !admin) {
    return {
      success: false,
      message: "Não foi possível excluir a ocorrência.",
    };
  }

  const { data: photos, error: photosError } = await supabase
    .from("occurrence_photos")
    .select("storage_path")
    .eq("occurrence_id", parsed.data.id);

  if (photosError)
    return {
      success: false,
      message: "Não foi possível excluir a ocorrência.",
    };

  const { data: deleted, error } = await supabase.rpc(
    "soft_delete_occurrence",
    {
      p_occurrence_id: parsed.data.id,
    }
  );

  if (error || !deleted) {
    return {
      success: false,
      message: "Só o autor pode excluir uma ocorrência pendente.",
    };
  }

  const storagePaths = (photos ?? []).map((photo) => photo.storage_path);
  if (storagePaths.length > 0) {
    const { error: storageError } = await admin.storage
      .from("occurrence-photos")
      .remove(storagePaths);

    if (!storageError) {
      await admin
        .from("occurrence_photos")
        .delete()
        .eq("occurrence_id", parsed.data.id);
    }
  }

  return { success: true };
}

export async function addOccurrenceComment(
  input: unknown
): Promise<OccurrenceActionResult> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: "Escreva um comentário antes de enviar.",
    };

  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase)
    return { success: false, message: "Sua sessão expirou." };

  const { error } = await supabase.from("occurrence_comments").insert({
    occurrence_id: parsed.data.occurrenceId,
    author_profile_id: user.id,
    body: parsed.data.body,
  });

  if (error)
    return {
      success: false,
      message: "Você não tem permissão para comentar nesta ocorrência.",
    };
  return { success: true };
}

export async function deleteOccurrenceComment(
  input: unknown
): Promise<OccurrenceActionResult> {
  const parsed = commentIdSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Comentário inválido." };

  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase)
    return { success: false, message: "Sua sessão expirou." };

  const { data, error } = await supabase
    .from("occurrence_comments")
    .delete()
    .eq("id", parsed.data.id)
    .eq("author_profile_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      message: "Este comentário não está mais disponível.",
    };
  }

  return { success: true };
}
