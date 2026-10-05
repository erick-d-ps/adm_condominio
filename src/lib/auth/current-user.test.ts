import {
  getCurrentAppUser,
  requireEmployee,
  requireResident,
} from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

jest.mock("server-only", () => ({}));
jest.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

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
  auth: { getClaims: jest.fn() },
  from: jest.fn((table: string) =>
    table === "profiles" ? profileQuery : residentQuery
  ),
};

const mockCreateSupabaseServerClient = jest.mocked(createSupabaseServerClient);

describe("getCurrentAppUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue(mockSupabase as never);
    mockSupabase.auth.getClaims.mockResolvedValue({
      data: { claims: { sub: "user-id" } },
      error: null,
    });
    profileQuery.maybeSingle.mockResolvedValue({
      data: {
        id: "user-id",
        role: "employee",
        display_name: "Admin",
        is_active: true,
      },
      error: null,
    });
    residentQuery.maybeSingle.mockResolvedValue({
      data: { tower: "A", apartment: "101", is_active: true },
      error: null,
    });
  });

  it("returns null without a Supabase client or a valid authenticated subject", async () => {
    mockCreateSupabaseServerClient.mockResolvedValueOnce(null as never);
    await expect(getCurrentAppUser()).resolves.toBeNull();

    mockSupabase.auth.getClaims.mockResolvedValueOnce({
      data: { claims: {} },
      error: null,
    });
    await expect(getCurrentAppUser()).resolves.toBeNull();

    mockSupabase.auth.getClaims.mockResolvedValueOnce({
      data: null,
      error: new Error("invalid session"),
    });
    await expect(getCurrentAppUser()).resolves.toBeNull();
  });

  it("returns an active employee identity", async () => {
    await expect(getCurrentAppUser()).resolves.toEqual({
      id: "user-id",
      role: "employee",
      displayName: "Admin",
    });
    expect(residentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it("returns an active resident identity with their unit", async () => {
    profileQuery.maybeSingle.mockResolvedValue({
      data: {
        id: "user-id",
        role: "resident",
        display_name: "Morador",
        is_active: true,
      },
      error: null,
    });

    await expect(getCurrentAppUser()).resolves.toEqual({
      id: "user-id",
      role: "resident",
      displayName: "Morador",
      tower: "A",
      apartment: "101",
    });
  });

  it.each([
    [
      "inactive profile",
      {
        id: "user-id",
        role: "employee",
        display_name: "Admin",
        is_active: false,
      },
    ],
    [
      "unsupported role",
      { id: "user-id", role: "unknown", display_name: "User", is_active: true },
    ],
    ["missing profile", null],
  ])("rejects an %s", async (_label, profile) => {
    profileQuery.maybeSingle.mockResolvedValue({ data: profile, error: null });

    await expect(getCurrentAppUser()).resolves.toBeNull();
    expect(residentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it("rejects the session when reading the profile fails", async () => {
    profileQuery.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });

    await expect(getCurrentAppUser()).resolves.toBeNull();
    expect(residentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it("rejects resident sessions when the resident record is inactive, missing, or unreadable", async () => {
    profileQuery.maybeSingle.mockResolvedValue({
      data: {
        id: "user-id",
        role: "resident",
        display_name: "Morador",
        is_active: true,
      },
      error: null,
    });

    residentQuery.maybeSingle.mockResolvedValueOnce({
      data: { tower: "A", apartment: "101", is_active: false },
      error: null,
    });
    await expect(getCurrentAppUser()).resolves.toBeNull();

    residentQuery.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });
    await expect(getCurrentAppUser()).resolves.toBeNull();

    residentQuery.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: new Error("database unavailable"),
    });
    await expect(getCurrentAppUser()).resolves.toBeNull();
  });
});

describe("role guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSupabaseServerClient.mockResolvedValue(mockSupabase as never);
    mockSupabase.auth.getClaims.mockResolvedValue({
      data: { claims: { sub: "user-id" } },
      error: null,
    });
    profileQuery.maybeSingle.mockResolvedValue({
      data: {
        id: "user-id",
        role: "employee",
        display_name: "Admin",
        is_active: true,
      },
      error: null,
    });
    residentQuery.maybeSingle.mockResolvedValue({
      data: { tower: "A", apartment: "101", is_active: true },
      error: null,
    });
  });

  it("returns the authorized identity for the matching guard", async () => {
    await expect(requireEmployee()).resolves.toMatchObject({
      role: "employee",
    });

    profileQuery.maybeSingle.mockResolvedValue({
      data: {
        id: "user-id",
        role: "resident",
        display_name: "Morador",
        is_active: true,
      },
      error: null,
    });
    await expect(requireResident()).resolves.toMatchObject({
      role: "resident",
    });
  });

  it.each([
    ["employee", requireEmployee, "/funcionario/login"],
    ["resident", requireResident, "/morador/acesso"],
  ])(
    "redirects an unauthenticated user away from the %s area",
    async (_role, guard, destination) => {
      mockSupabase.auth.getClaims.mockResolvedValue({
        data: { claims: {} },
        error: null,
      });

      await expect(guard()).rejects.toThrow(`REDIRECT:${destination}`);
    }
  );

  it("redirects a resident away from the employee area and an employee away from the resident area", async () => {
    profileQuery.maybeSingle.mockResolvedValue({
      data: {
        id: "user-id",
        role: "resident",
        display_name: "Morador",
        is_active: true,
      },
      error: null,
    });
    await expect(requireEmployee()).rejects.toThrow(
      "REDIRECT:/funcionario/login"
    );

    profileQuery.maybeSingle.mockResolvedValue({
      data: {
        id: "user-id",
        role: "employee",
        display_name: "Admin",
        is_active: true,
      },
      error: null,
    });
    await expect(requireResident()).rejects.toThrow("REDIRECT:/morador/acesso");
  });
});
