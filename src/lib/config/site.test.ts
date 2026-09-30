import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { siteUrl } from "@/lib/config/site";

describe("siteUrl", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("falls back to https + the agency's primary domain when unset", () => {
    expect(siteUrl()).toBe("https://eliteinsuranceknoxville.com");
  });

  it("prefers NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://4k-elite-insurance.vercel.app";
    expect(siteUrl()).toBe("https://4k-elite-insurance.vercel.app");
  });
});
