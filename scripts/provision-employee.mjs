import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.");
  process.exitCode = 1;
} else {
  const admin = createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const authUsers = await listAuthUsers(admin);
    const profiles = await listProfiles(admin);
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const profilesByEmail = new Map(profiles.map((profile) => [profile.email, profile]));
    const summary = { linked: 0, alreadyLinked: 0, skipped: 0 };

    for (const authUser of authUsers) {
      const email = authUser.email?.trim().toLowerCase();

      if (!email) {
        summary.skipped += 1;
        console.warn(`Usuário Auth ${authUser.id} ignorado: sem e-mail.`);
        continue;
      }

      const profile = profilesById.get(authUser.id) ?? profilesByEmail.get(email);

      if (profile?.role === "employee" && profile.id === authUser.id) {
        summary.alreadyLinked += 1;
        continue;
      }

      if (profile) {
        summary.skipped += 1;
        console.warn(`${email} já possui outro perfil; nenhum dado foi alterado.`);
        continue;
      }

      const displayName = readDisplayName(authUser, email);
      const { error: profileError } = await admin.from("profiles").insert({
        id: authUser.id,
        email,
        role: "employee",
        display_name: displayName,
        is_active: true,
      });

      if (profileError) {
        summary.skipped += 1;
        console.error(`Não foi possível vincular o perfil de ${email}.`);
        continue;
      }

      const { error: metadataError } = await admin.auth.admin.updateUserById(authUser.id, {
        app_metadata: { ...authUser.app_metadata, role: "employee" },
      });

      if (metadataError) {
        console.warn(`Perfil de ${email} criado, mas o papel no Auth não foi atualizado.`);
      }

      summary.linked += 1;
      console.log(`Funcionário vinculado a partir do Users: ${email}`);
    }

    if (authUsers.length === 0) {
      console.error("Nenhum usuário encontrado em Authentication > Users. Crie a conta lá antes de executar este comando.");
      process.exitCode = 1;
    } else {
      console.log(
        `Verificação concluída. Vinculados: ${summary.linked}. Já vinculados: ${summary.alreadyLinked}. Ignorados: ${summary.skipped}.`,
      );
    }
  } catch {
    console.error("Não foi possível consultar os usuários do Supabase Auth.");
    process.exitCode = 1;
  }
}

async function listAuthUsers(admin) {
  const users = [];
  const perPage = 200;

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < perPage) return users;
  }
}

async function listProfiles(admin) {
  const profiles = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from("profiles")
      .select("id, email, role")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    profiles.push(...(data ?? []));
    if (!data || data.length < pageSize) return profiles;
  }
}

function readDisplayName(authUser, email) {
  const metadata = authUser.user_metadata ?? {};
  const candidate = metadata.display_name ?? metadata.full_name ?? metadata.name;

  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return email.split("@")[0];
}