import { defineField, defineType } from "sanity";
import { insuranceLines } from "@/lib/config/agency";
import { formatLine } from "@/lib/format/insuranceLine";

export const postType = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Draft — not visible on the site", value: "draft" },
          { title: "Published — live on /blog", value: "published" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "Shown on the /blog index and used as the page's meta description.",
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "author",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "insuranceLines",
      title: "Insurance Lines",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: insuranceLines.map((line) => ({ title: formatLine(line), value: line })),
      },
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sourceUrl",
      title: "Source URL (migrated posts only)",
      type: "url",
      description: "Original URL this post was migrated from, if applicable.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status" },
  },
});
