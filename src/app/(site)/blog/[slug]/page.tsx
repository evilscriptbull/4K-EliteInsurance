import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getAllPublishedSlugs, getPostBySlug } from "@/lib/sanity/queries";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { CTABanner } from "@/components/ui/CTABanner";
import { formatLine } from "@/lib/format/insuranceLine";

type PageParams = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mt-10 font-serif text-2xl font-semibold text-brand-900">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 font-serif text-xl font-semibold text-brand-900">{children}</h3>,
    normal: ({ children }) => <p className="mt-4 text-lg leading-relaxed text-brand-800">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-lg text-brand-800">{children}</ul>,
  },
};

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Section background="brand">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {post.insuranceLines.map((line) => (
              <Badge key={line}>{formatLine(line)}</Badge>
            ))}
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-sm text-brand-200">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}{" "}
            · {post.author}
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <PortableText value={post.body} components={portableTextComponents} />
        </div>
      </Section>

      <CTABanner
        heading="Have questions about your coverage?"
        body="Talk to a licensed independent agent — no obligation."
        ctaLabel="Get a Quote"
        ctaHref="/quote"
      />
    </>
  );
}
