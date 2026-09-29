import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "employee" | "resident";

export type CurrentAppUser = {
  id: string;
  role: AppRole;
  displayName: string;
  tower?: string;
  apartment?: string;
};

export async function getCurrentAppUser(): Promise<CurrentAppUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile?.is_active || (profile.role !== "employee" && profile.role !== "resident")) {
    return null;
  }

  if (profile.role === "employee") {
    return {
      id: profile.id,
      role: "employee",
      displayName: profile.display_name,
    };
  }

  const { data: resident, error: residentError } = await supabase
    .from("residents")
    .select("tower, apartment, is_active")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (residentError || !resident?.is_active) return null;

  return {
    id: profile.id,
    role: "resident",
    displayName: profile.display_name,
    tower: resident.tower,
    apartment: resident.apartment,
  };
}

export async function requireEmployee(): Promise<CurrentAppUser> {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "employee") redirect("/funcionario/login");
  return user;
}

export async function requireResident(): Promise<CurrentAppUser> {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "resident") redirect("/morador/acesso");
  return user;
}