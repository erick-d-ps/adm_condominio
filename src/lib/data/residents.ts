import "server-only";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ResidentListItem = {
  id: string;
  name: string;
  email: string;
  tower: string;
  apartment: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
};

export async function getResidents(): Promise<{ state: "ready"; residents: ResidentListItem[] } | { state: "unavailable" }> {
  const user = await getCurrentAppUser();
  const admin = createSupabaseAdminClient();
  if (!user || user.role !== "employee" || !admin) return { state: "unavailable" };

  const { data: residentRows, error: residentError } = await admin
    .from("residents")
    .select("profile_id, tower, apartment, phone, is_active, created_at")
    .order("created_at", { ascending: false });

  if (residentError) return { state: "unavailable" };

  const residentIds = (residentRows ?? []).map((resident) => resident.profile_id);
  const { data: profiles, error: profileError } = residentIds.length > 0
    ? await admin.from("profiles").select("id, email, display_name").in("id", residentIds)
    : { data: [], error: null };

  if (profileError) return { state: "unavailable" };

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return {
    state: "ready",
    residents: (residentRows ?? []).flatMap((resident) => {
      const profile = profilesById.get(resident.profile_id);
      if (!profile) return [];
      return [{
        id: resident.profile_id,
        name: profile.display_name,
        email: profile.email,
        tower: resident.tower,
        apartment: resident.apartment,
        phone: resident.phone,
        isActive: resident.is_active,
        createdAt: resident.created_at,
      }];
    }),
  };
}