import type { PortableTextBlock } from "@/lib/sanity/types";

/**
 * Simple authoring format for programmatically generated post bodies
 * (migration + seed scripts), converted into real Sanity Portable Text
 * blocks so posts render correctly and stay editable in Sanity Studio later.
 */
export type ContentSection =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

let keyCounter = 0;
function nextKey(): string {
  keyCounter += 1;
  return `k${keyCounter}`;
}

function span(text: string): PortableTextBlock["children"][number] {
  return { _type: "span", _key: nextKey(), text, marks: [] };
}

export function toPortableText(sections: ContentSection[]): PortableTextBlock[] {
  return sections.flatMap((section): PortableTextBlock[] => {
    if (section.type === "heading") {
      return [
        {
          _type: "block",
          _key: nextKey(),
          style: section.level === 2 ? "h2" : "h3",
          markDefs: [],
          children: [span(section.text)],
        },
      ];
    }
    if (section.type === "list") {
      // Each list item is its own block with listItem/level set, per the
      // Portable Text spec — Sanity renders consecutive blocks with the
      // same listItem as a single <ul>.
      return section.items.map((item) => ({
        _type: "block",
        _key: nextKey(),
        style: "normal",
        listItem: "bullet",
        level: 1,
        markDefs: [],
        children: [span(item)],
      }));
    }
    return [
      {
        _type: "block",
        _key: nextKey(),
        style: "normal",
        markDefs: [],
        children: [span(section.text)],
      },
    ];
  });
}
