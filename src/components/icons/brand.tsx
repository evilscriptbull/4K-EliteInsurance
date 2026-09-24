import { Duotone, Icon, type IconProps } from "@/components/icons/Icon";

/**
 * Elite's mark: twin peaks, echoing the mountain motif in every logo concept
 * in the old site's asset library (see docs/architecture.md — "Media"). Drawn
 * fresh in this icon system's style instead of importing one of those raster
 * files, so it recolors with `currentColor` on both the navy header/footer
 * and any future light background, at any size, with no separate light/dark
 * export to keep in sync.
 */
export function BrandMarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" fillRule="evenodd" d="M2.5 18.5 8 6l5.5 12.5zM10 18.5 15 9l6.5 9.5z" />
      </Duotone>
      <path d="M2.5 18.5 8 6l5.5 12.5M10 18.5 15 9l6.5 9.5M2.5 18.5h19" />
    </Icon>
  );
}
