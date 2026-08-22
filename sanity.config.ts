import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";

export default defineConfig({
  name: "elite-insurance-group",
  title: "Elite Insurance Group — Blog CMS",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Draft posts (pending review)")
              .child(S.documentList().title("Draft posts").filter('_type == "post" && status == "draft"')),
            S.listItem()
              .title("Published posts")
              .child(
                S.documentList().title("Published posts").filter('_type == "post" && status == "published"'),
              ),
            S.divider(),
            S.listItem()
              .title("All posts")
              .child(S.documentTypeList("post").title("All posts")),
          ]),
    }),
    visionTool(),
  ],
});
