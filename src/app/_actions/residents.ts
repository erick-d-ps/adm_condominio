"use server";

import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const residentSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(12),
  tower: z.string().trim().min(1).max(40),
  apartment: z.string().trim().min(1).max(40),
  phone: z.string().trim().min(1).max(40),
});

const activeSchema = z.object({
  residentId: z.string().uuid(),
  isActive: z.boolean(),
});

const updateResidentSchema = residentSchema.extend({
  residentId: z.string().uuid(),
});

export type ResidentActionResult = {
  success: boolean;
  message?: string;
};

async function requireEmployeeAdmin() {
  const user = await getCurrentAppUser();
  const admin = createSupabaseAdminClient();
  if (!user || user.role !== "employee" || !admin) return null;
  return { user, admin };
}

export async function createResident(input: unknown): Promise<ResidentActionResult> {
  const parsed = residentSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Revise os campos obrigatórios do morador." };

  const context = await requireEmployeeAdmin();
  if (!context) return { success: false, message: "Acesso indisponível. Entre novamente." };

  const { name, email, password, tower, apartment, phone } = parsed.data;
  const { data: authData, error: authError } = await context.admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
    app_metadata: { role: "resident" },
  });

  if (authError || !authData.user) {
    return { success: false, message: "Este e-mail já está cadastrado ou não pode ser usado." };
  }

  const profileId = authData.user.id;
  const { error: profileError } = await context.admin.from("profiles").insert({
    id: profileId,
    email,
    role: "resident",
    display_name: name,
    is_active: true,
  });

  if (profileError) {
    await context.admin.auth.admin.deleteUser(profileId);
    return {
      success: false,
      message: profileError.code === "23505"
        ? "Este e-mail já está cadastrado."
        : "Não foi possível salvar o cadastro do morador.",
    };
  }

  const { error: residentError } = await context.admin.from("residents").insert({
    profile_id: profileId,
    tower,
    apartment,
    phone,
    is_active: true,
  });

  if (residentError) {
    await context.admin.from("profiles").delete().eq("id", profileId);
    await context.admin.auth.admin.deleteUser(profileId);
    return {
      success: false,
      message: residentError.code === "23505"
        ? "Já existe um morador ativo nesta unidade."
        : "Não foi possível salvar o cadastro do morador.",
    };
  }

  return { success: true, message: "Morador cadastrado. Compartilhe a senha inicial por um canal seguro." };
}

export async function setResidentActive(input: unknown): Promise<ResidentActionResult> {
  const parsed = activeSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Morador inválido." };

  const context = await requireEmployeeAdmin();
  if (!context) return { success: false, message: "Acesso indisponível. Entre novamente." };

  const { residentId, isActive } = parsed.data;
  const { data: resident, error: residentReadError } = await context.admin
    .from("residents")
    .select("profile_id, tower, apartment, is_active")
    .eq("profile_id", residentId)
    .maybeSingle();

  if (residentReadError || !resident) return { success: false, message: "Morador não encontrado." };

  if (isActive && !resident.is_active) {
    const { data: activeUnits, error: occupiedError } = await context.admin
      .from("residents")
      .select("profile_id, tower, apartment")
      .eq("is_active", true);

    const unitIsOccupied = (activeUnits ?? []).some((activeResident) =>
      activeResident.profile_id !== residentId
      && activeResident.tower.trim().toLocaleUpperCase("pt-BR") === resident.tower.trim().toLocaleUpperCase("pt-BR")
      && activeResident.apartment.trim().toLocaleUpperCase("pt-BR") === resident.apartment.trim().toLocaleUpperCase("pt-BR")
    );

    if (occupiedError || unitIsOccupied) {
      return { success: false, message: "Esta unidade já tem um morador ativo." };
    }
  }

  const { error: residentUpdateError } = await context.admin
    .from("residents")
    .update({ is_active: isActive })
    .eq("profile_id", residentId);

  if (residentUpdateError) {
    return {
      success: false,
      message: residentUpdateError.code === "23505"
        ? "Esta unidade já tem um morador ativo."
        : "Não foi possível atualizar a situação do morador.",
    };
  }

  const { error: profileUpdateError } = await context.admin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", residentId);

  if (profileUpdateError) {
    await context.admin.from("residents").update({ is_active: resident.is_active }).eq("profile_id", residentId);
    return { success: false, message: "Não foi possível atualizar a situação do morador." };
  }

  return {
    success: true,
    message: isActive ? "Morador reativado. O acesso com e-mail e senha foi liberado." : "Morador inativado; o acesso às ocorrências foi bloqueado.",
  };
}

export async function updateResident(input: unknown): Promise<ResidentActionResult> {
  const parsed = updateResidentSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Revise os campos obrigatórios do morador." };

  const context = await requireEmployeeAdmin();
  if (!context) return { success: false, message: "Acesso indisponível. Entre novamente." };

  const { residentId, name, email, tower, apartment, phone } = parsed.data;
  const [{ data: oldProfile, error: profileReadError }, { data: oldResident, error: residentReadError }] = await Promise.all([
    context.admin.from("profiles").select("email, display_name").eq("id", residentId).maybeSingle(),
    context.admin.from("residents").select("tower, apartment, phone, is_active").eq("profile_id", residentId).maybeSingle(),
  ]);

  if (profileReadError || residentReadError || !oldProfile || !oldResident) {
    return { success: false, message: "Morador não encontrado." };
  }

  if (oldResident.is_active) {
    const { data: activeUnits, error: occupiedError } = await context.admin
      .from("residents")
      .select("profile_id, tower, apartment")
      .eq("is_active", true);

    const unitIsOccupied = (activeUnits ?? []).some((activeResident) =>
      activeResident.profile_id !== residentId
      && activeResident.tower.trim().toLocaleUpperCase("pt-BR") === tower.trim().toLocaleUpperCase("pt-BR")
      && activeResident.apartment.trim().toLocaleUpperCase("pt-BR") === apartment.trim().toLocaleUpperCase("pt-BR")
    );

    if (occupiedError || unitIsOccupied) {
      return { success: false, message: "Esta unidade já tem um morador ativo." };
    }
  }

  const emailChanged = email !== oldProfile.email;
  if (emailChanged) {
    const { data: emailOwner, error: emailError } = await context.admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .neq("id", residentId)
      .maybeSingle();

    if (emailError || emailOwner) {
      return { success: false, message: "Este e-mail já está cadastrado." };
    }

    const { error: authUpdateError } = await context.admin.auth.admin.updateUserById(residentId, {
      email,
      email_confirm: true,
      user_metadata: { display_name: name },
    });

    if (authUpdateError) {
      return { success: false, message: "Não foi possível atualizar o e-mail de acesso." };
    }
  }

  const { error: profileUpdateError } = await context.admin
    .from("profiles")
    .update({ email, display_name: name })
    .eq("id", residentId);

  if (profileUpdateError) {
    if (emailChanged) {
      await context.admin.auth.admin.updateUserById(residentId, {
        email: oldProfile.email,
        email_confirm: true,
        user_metadata: { display_name: oldProfile.display_name },
      });
    }
    return {
      success: false,
      message: profileUpdateError.code === "23505"
        ? "Este e-mail já está cadastrado."
        : "Não foi possível atualizar os dados do morador.",
    };
  }

  const { error: residentUpdateError } = await context.admin
    .from("residents")
    .update({ tower, apartment, phone })
    .eq("profile_id", residentId);

  if (residentUpdateError) {
    await context.admin.from("profiles").update(oldProfile).eq("id", residentId);
    if (emailChanged) {
      await context.admin.auth.admin.updateUserById(residentId, {
        email: oldProfile.email,
        email_confirm: true,
        user_metadata: { display_name: oldProfile.display_name },
      });
    }
    return {
      success: false,
      message: residentUpdateError.code === "23505"
        ? "Esta unidade já tem um morador ativo."
        : "Não foi possível atualizar os dados do morador.",
    };
  }

  return {
    success: true,
    message: "Cadastro atualizado.",
  };
}