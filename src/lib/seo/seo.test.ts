import { describe, it, expect, vi, beforeEach } from "vitest";
import { agency, licensedStates } from "@/lib/config/agency";
import { landingPages } from "@/lib/config/landing-pages";
import { quoteFormFamilies } from "@/lib/config/quote-forms";
import { resolveBlogCta } from "@/lib/seo/blogCta";
import { buildAgencyJsonLd, serializeJsonLd } from "@/lib/seo/agencyJsonLd";

const getPublishedPostIndexMock = vi.fn();
vi.mock("@/lib/sanity/queries", () => ({ getPublishedPostIndex: getPublishedPostIndexMock }));

const { default: sitemap } = await import("@/app/sitemap");
const { default: robots } = await import("@/app/robots");

beforeEach(() => {
  getPublishedPostIndexMock.mockReset();
  getPublishedPostIndexMock.mockResolvedValue([]);
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
});

describe("sitemap", () => {
  it("lists static pages, every landing page, and every quote family form", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain("https://example.test");
    expect(urls).toContain("https://example.test/quote");
    expect(urls).toContain("https://example.test/blog");
    for (const page of landingPages) expect(urls).toContain(`https://example.test${page.slug}`);
    for (const family of quoteFormFamilies) expect(urls).toContain(`https://example.test/quote/${family.slug}`);
  });

  it("includes published blog posts with lastModified from publishedAt", async () => {
    getPublishedPostIndexMock.mockResolvedValue([{ slug: "guide", publishedAt: "2026-08-01T00:00:00.000Z" }]);
    const entry = (await sitemap()).find((e) => e.url === "https://example.test/blog/guide");
    expect(entry?.lastModified).toEqual(new Date("2026-08-01T00:00:00.000Z"));
  });

  it("has no blog entries (and doesn't throw) when there are no published posts / Sanity is unconfigured", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/blog/"))).toBe(false);
  });

  it("never lists chat, staff, studio, api, or design pages", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const url of urls) {
      expect(url).not.toMatch(/\/chat$|\/staff|\/studio|\/api|\/design/);
    }
  });

  it("has no duplicate URLs", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("robots", () => {
  it("allows the site, disallows studio/staff/api, and points at the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/staff", "/api"] },
      sitemap: "https://example.test/sitemap.xml",
    });
  });
});

describe("agency JSON-LD", () => {
  const ld = buildAgencyJsonLd();

  it("is an InsuranceAgency populated from agency config", () => {
    expect(ld["@type"]).toBe("InsuranceAgency");
    expect(ld.name).toBe(agency.legalName);
    expect(ld.telephone).toBe(agency.phone);
    expect(ld.address.streetAddress).toBe(agency.address.street);
    expect(ld.address.postalCode).toBe(agency.address.zip);
    expect(ld.areaServed).toEqual([...licensedStates]);
    expect(ld.sameAs).toEqual(Object.values(agency.social));
  });

  it("claims nothing beyond config: no ratings, reviews, price range, or hours", () => {
    for (const key of ["aggregateRating", "review", "priceRange", "openingHours", "openingHoursSpecification"]) {
      expect(ld).not.toHaveProperty(key);
    }
  });

  it("escapes < so a value can never close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("resolveBlogCta", () => {
  it("defaults to the general quote page", () => {
    expect(resolveBlogCta(undefined)).toEqual({ href: "/quote", label: "Get a Quote" });
  });

  it("links to a valid landing page and says so in the label", () => {
    const page = landingPages[0];
    expect(resolveBlogCta(page.slug)).toEqual({ href: page.slug, label: `Explore ${page.label}` });
  });

  it("falls back to the default for a slug that no longer exists", () => {
    expect(resolveBlogCta("/removed-page")).toEqual({ href: "/quote", label: "Get a Quote" });
  });
});
