import {
  signInEmployee,
  signInResident,
  signOutEmployee,
  signOutResident,
} from "@/app/_actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
  from: jest.fn((table: string) =>
    table === "profiles" ? profileQuery : residentQuery
  ),
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
    const result = await signInResident({
      email: " MORADOR@EXEMPLO.COM ",
      password: "senha-segura-123",
    });

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

    const result = await signInResident({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(residentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it("signs out residents whose residential record is inactive", async () => {
    residentQuery.maybeSingle.mockResolvedValue({
      data: { is_active: false },
      error: null,
    });

    const result = await signInResident({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it("signs out when the resident profile is inactive", async () => {
    profileQuery.maybeSingle.mockResolvedValue({
      data: { role: "resident", is_active: false },
      error: null,
    });

    const result = await signInResident({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    expect(residentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it.each([
    ["profile", profileQuery],
    ["resident record", residentQuery],
  ])("signs out when reading the %s fails", async (_label, query) => {
    query.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });

    const result = await signInResident({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("signs out when the resident profile is missing", async () => {
    profileQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await signInResident({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    expect(residentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it("does not authenticate when Supabase rejects the credentials", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error("invalid credentials"),
    });

    const result = await signInResident({
      email: "morador@exemplo.com",
      password: "senha-errada",
    });

    expect(result.success).toBe(false);
    expect(profileQuery.maybeSingle).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("fails closed when the Supabase client is unavailable", async () => {
    mockCreateSupabaseServerClient.mockResolvedValue(null as never);

    const result = await signInResident({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});

describe("signInEmployee", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue(mockSupabase as never);
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "employee-id" } },
      error: null,
    });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    profileQuery.maybeSingle.mockResolvedValue({
      data: { role: "employee", is_active: true },
      error: null,
    });
  });

  it("allows an employee with valid credentials and employee role", async () => {
    const result = await signInEmployee({
      email: "admin@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result).toEqual({ success: true });
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "admin@exemplo.com",
      password: "senha-segura-123",
    });
    expect(profileQuery.select).toHaveBeenCalledWith("role");
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("signs out when valid credentials belong to a resident", async () => {
    profileQuery.maybeSingle.mockResolvedValue({
      data: { role: "resident", is_active: true },
      error: null,
    });

    const result = await signInEmployee({
      email: "morador@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "profile query error",
      { data: null, error: new Error("database unavailable") },
    ],
    ["missing profile", { data: null, error: null }],
  ])("signs out after a %s", async (_label, profileResult) => {
    profileQuery.maybeSingle.mockResolvedValue(profileResult);

    const result = await signInEmployee({
      email: "admin@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("does not authenticate when Supabase rejects the credentials", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error("invalid credentials"),
    });

    const result = await signInEmployee({
      email: "admin@exemplo.com",
      password: "senha-errada",
    });

    expect(result.success).toBe(false);
    expect(profileQuery.maybeSingle).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("fails closed when the Supabase client is unavailable", async () => {
    mockCreateSupabaseServerClient.mockResolvedValue(null as never);

    const result = await signInEmployee({
      email: "admin@exemplo.com",
      password: "senha-segura-123",
    });

    expect(result.success).toBe(false);
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});

describe("sign out", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue(mockSupabase as never);
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
  });

  it.each([
    [signOutEmployee, "/funcionario/login"],
    [signOutResident, "/morador/acesso"],
  ])(
    "revokes the current session and redirects to %s",
    async (signOut, destination) => {
      await signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith(destination);
    }
  );
});
