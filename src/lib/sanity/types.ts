import type { InsuranceLine } from "@/lib/config/agency";

export interface PortableTextSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

export interface PortableTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3";
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: [];
  children: PortableTextSpan[];
}

export type BlogPostStatus = "draft" | "published";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  insuranceLines: InsuranceLine[];
  status: BlogPostStatus;
  body: PortableTextBlock[];
  sourceUrl?: string;
}
