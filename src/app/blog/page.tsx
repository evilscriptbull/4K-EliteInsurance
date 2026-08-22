import type { Metadata } from "next";
import Link from "next/link";
import { agency } from "@/lib/config/agency";
import { getAllPosts } from "@/lib/sanity/queries";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatLine } from "@/lib/format/insuranceLine";

export const metadata: Metadata = {
  title: "Blog",
  description: `Insurance guides and updates from ${agency.legalName}, serving ${agency.address.region} and beyond.`,
};

export const revalidate = 300;

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <>
      <Section background="brand">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-brand-100">Guides and updates from the {agency.legalName} team.</p>
        </div>
      </Section>

      <Section>
        <PostList posts={posts} />
      </Section>
    </>
  );
}

function PostList({ posts }: { posts: Awaited<ReturnType<typeof getAllPosts>> }) {
  if (posts.length === 0) {
    return <p className="text-center text-brand-700">No posts published yet — check back soon.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link key={post._id} href={`/blog/${post.slug}`}>
          <Card className="h-full transition hover:border-accent-400 hover:shadow-sm">
            <div className="flex flex-wrap gap-2">
              {post.insuranceLines.slice(0, 2).map((line) => (
                <Badge key={line}>{formatLine(line)}</Badge>
              ))}
            </div>
            <h2 className="mt-3 font-serif text-xl font-semibold text-brand-900">{post.title}</h2>
            <p className="mt-2 text-sm text-brand-700">{post.excerpt}</p>
            <p className="mt-4 text-xs text-brand-500">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}{" "}
              · {post.author}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
