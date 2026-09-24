import { describe, it, expect } from "vitest";
import { verifyStaffRequest } from "@/lib/staff/verifyRequest";
import type { getSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { Associate } from "@/lib/associates/store";

const activeAssociate: Associate = {
  id: "user-1",
  name: "Jane Agent",
  email: "jane@example.com",
  active: true,
  passwordSetAt: null,
};

function fakeAdmin(getUserResult: { data: { user: { id: string } | null }; error: unknown }) {
  return (() => ({
    auth: { getUser: async () => getUserResult },
  })) as unknown as typeof getSupabaseAdminClient;
}

function request(token?: string) {
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return new Request("http://localhost/api/staff/claim", { method: "POST", headers });
}

describe("verifyStaffRequest", () => {
  it("returns 401 when there's no bearer token", async () => {
    const result = await verifyStaffRequest(request());
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(401);
  });

  it("returns 503 when the admin client isn't configured", async () => {
    const result = await verifyStaffRequest(request("token"), {
      getSupabaseAdminClient: (() => null) as unknown as typeof getSupabaseAdminClient,
    });
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(503);
  });

  it("returns 401 for an invalid session", async () => {
    const result = await verifyStaffRequest(request("bad-token"), {
      getSupabaseAdminClient: fakeAdmin({ data: { user: null }, error: new Error("invalid") }),
    });
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(401);
  });

  it("returns 403 not-an-associate when there's no associate row", async () => {
    const result = await verifyStaffRequest(request("token"), {
      getSupabaseAdminClient: fakeAdmin({ data: { user: { id: "user-1" } }, error: null }),
      getAssociate: async () => null,
    });
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(403);
      expect(await result.error.json()).toMatchObject({ error: "not-an-associate" });
    }
  });

  it("returns 403 not-an-associate when the associate is inactive", async () => {
    const result = await verifyStaffRequest(request("token"), {
      getSupabaseAdminClient: fakeAdmin({ data: { user: { id: "user-1" } }, error: null }),
      getAssociate: async () => ({ ...activeAssociate, active: false }),
    });
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(403);
  });

  it("resolves userId and associate for a valid, active session", async () => {
    const result = await verifyStaffRequest(request("token"), {
      getSupabaseAdminClient: fakeAdmin({ data: { user: { id: "user-1" } }, error: null }),
      getAssociate: async () => activeAssociate,
    });
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.userId).toBe("user-1");
      expect(result.associate).toEqual(activeAssociate);
    }
  });
});
