import { signInResident } from "@/app/_actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));
jest.mock("@/lib/auth/current-user", () => ({
  getCurrentAppUser: jest.fn(),
}));
jest.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: jest.fn(),
}));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

const profileQuery = {
  select: jest.fn(),
  eq: jest.fn(),
  maybeSingle: jest.fn(),
};
profileQuery.select.mockReturnValue(profileQuery);
profileQuery.eq.mockReturnValue(profileQuery);

const residentQuery = {
  select: jest.fn(),
  eq: jest.fn(),
  maybeSingle: jest.fn(),
};
residentQuery.select.mockReturnValue(residentQuery);
residentQuery.eq.mockReturnValue(residentQuery);

const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn((table: string) => table === "profiles" ? profileQuery : residentQuery),
};

const mockCreateSupabaseServerClient = jest.mocked(createSupabaseServerClient);

describe("signInResident", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue(mockSupabase as never);
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "resident-id" } },
      error: null,
    });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    profileQuery.maybeSingle.mockResolvedValue({
      data: { role: "resident", is_active: true },
      error: null,
    });
    residentQuery.maybeSingle.mockResolvedValue({
      data: { is_active: true },
      error: null,
    });
  });

  it("allows an active resident with valid credentials", async () => {
    const result = await signInResident({ email: " MORADOR@EXEMPLO.COM ", password: "senha-segura-123" });

    expect(result).toEqual({ success: true });
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });
    expect(profileQuery.maybeSingle).toHaveBeenCalled();
    expect(residentQuery.maybeSingle).toHaveBeenCalled();
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("signs out users whose profile is not an active resident", async () => {
    profileQuery.maybeSingle.mockResolvedValue({
      data: { role: "employee", is_active: true },
      error: null,
    });

    const result = await signInResident({ email: "morador@exemplo.com", password: "senha-segura-123" });

    expect(result).toEqual({ success: false, message: "E-mail ou senha inválidos." });
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(residentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it("signs out residents whose residential record is inactive", async () => {
    residentQuery.maybeSingle.mockResolvedValue({
      data: { is_active: false },
      error: null,
    });

    const result = await signInResident({ email: "morador@exemplo.com", password: "senha-segura-123" });

    expect(result).toEqual({ success: false, message: "E-mail ou senha inválidos." });
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});