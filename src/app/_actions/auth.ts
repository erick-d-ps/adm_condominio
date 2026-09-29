"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/auth/current-user";

const employeeLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const residentLoginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});

const createOccurrenceSchema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(200),
  description: z.string().trim().min(1, "Informe a descrição.").max(10000),
  category: z.enum(["maintenance", "noise", "cleaning", "other"]),
  location: z.string().trim().min(1, "Informe o local.").max(200),
});

export type AuthActionResult = {
  success: boolean;
  message?: string;
};

export type CreateOccurrenceResult = AuthActionResult & {
  occurrenceId?: number;
  publicId?: string;
};

export async function signOutEmployee(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/funcionario/login");
}

export async function signOutResident(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/morador/acesso");
}

export async function signInEmployee(input: unknown): Promise<AuthActionResult> {
  const parsed = employeeLoginSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: "Informe um e-mail válido e a senha." };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "O acesso está temporariamente indisponível. Tente novamente mais tarde.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "employee") {
    await supabase.auth.signOut();
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  return { success: true };
}

export async function signInResident(input: unknown): Promise<AuthActionResult> {
  const parsed = residentLoginSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: "Informe um e-mail válido e a senha." };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "O acesso está temporariamente indisponível. Tente novamente mais tarde.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "resident" || !profile.is_active) {
    await supabase.auth.signOut();
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  const { data: resident, error: residentError } = await supabase
    .from("residents")
    .select("is_active")
    .eq("profile_id", data.user.id)
    .maybeSingle();

  if (residentError || !resident?.is_active) {
    await supabase.auth.signOut();
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  return { success: true };
}

export async function createOccurrence(input: unknown): Promise<CreateOccurrenceResult> {
  const parsed = createOccurrenceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Revise os campos obrigatórios da ocorrência." };
  }

  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) {
    return { success: false, message: "Sua sessão expirou. Entre novamente para continuar." };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const publicId = `OC-${randomBytes(4).toString("hex").toUpperCase()}`;
    const { data, error } = await supabase
      .from("occurrences")
      .insert({
        ...parsed.data,
        public_id: publicId,
        author_profile_id: user.id,
      })
      .select("id, public_id")
      .single();

    if (!error && data) {
      return { success: true, occurrenceId: data.id, publicId: data.public_id };
    }

    if (error?.code !== "23505") {
      return { success: false, message: "Não foi possível salvar a ocorrência." };
    }
  }

  return { success: false, message: "Não foi possível gerar um identificador. Tente novamente." };
}

