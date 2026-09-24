import { Duotone, Icon, type IconProps } from "@/components/icons/Icon";
import { shieldOutline } from "@/components/icons/coverage";

/* Trust */

export function ShieldCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d={shieldOutline} />
      </Duotone>
      <path d="m8.75 11.75 2.25 2.25 4.25-4.5" />
    </Icon>
  );
}

export function AwardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="9" r="5.75" />
      </Duotone>
      <circle cx="12" cy="9" r="2.75" />
      <path d="M8.4 13.5 7 20.5l5-2.5 5 2.5-1.4-7" />
    </Icon>
  );
}

/* Collector-vehicle coverage perks */

/** Agreed value. */
export function TagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h6.4a1.5 1.5 0 0 1 1.06.44l7.6 7.6a1.5 1.5 0 0 1 0 2.12l-6.4 6.4a1.5 1.5 0 0 1-2.12 0l-7.6-7.6A1.5 1.5 0 0 1 3.5 11.4z" />
      </Duotone>
      <circle cx="7.75" cy="7.75" r="1.25" />
    </Icon>
  );
}

/** Roadside assistance. */
export function TowTruckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" d="M13.5 9.5a1 1 0 0 1 1-1h3.6a1 1 0 0 1 .8.4l2.4 3.2a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-.25a2.75 2.75 0 0 0-5.5 0H13.5z" />
      </Duotone>
      <path d="M13.5 17V9.5a1 1 0 0 1 1-1h3.6a1 1 0 0 1 .8.4l2.4 3.2a1 1 0 0 1 .2.6V16a1 1 0 0 1-1 1h-1m-6-4.5h7.2" />
      <path d="M13.5 13.5h-10a1 1 0 0 0-1 1V16a1 1 0 0 0 1 1h1m4 0h7M10.5 13.5l-5-7v4.25a1.25 1.25 0 0 1-2.5 0" />
      <circle cx="6.5" cy="17" r="2" />
      <circle cx="17.5" cy="17" r="2" />
    </Icon>
  );
}

/** Spare parts. */
export function CogIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path
          fillRule="evenodd"
          d="M10.66 5.13 10.87 2.82A9.25 9.25 0 0 1 13.13 2.82L13.34 5.13A7 7 0 0 1 15.91 6.2L17.69 4.71A9.25 9.25 0 0 1 19.29 6.31L17.8 8.09A7 7 0 0 1 18.87 10.66L21.18 10.87A9.25 9.25 0 0 1 21.18 13.13L18.87 13.34A7 7 0 0 1 17.8 15.91L19.29 17.69A9.25 9.25 0 0 1 17.69 19.29L15.91 17.8A7 7 0 0 1 13.34 18.87L13.13 21.18A9.25 9.25 0 0 1 10.87 21.18L10.66 18.87A7 7 0 0 1 8.09 17.8L6.31 19.29A9.25 9.25 0 0 1 4.71 17.69L6.2 15.91A7 7 0 0 1 5.13 13.34L2.82 13.13A9.25 9.25 0 0 1 2.82 10.87L5.13 10.66A7 7 0 0 1 6.2 8.09L4.71 6.31A9.25 9.25 0 0 1 6.31 4.71L8.09 6.2A7 7 0 0 1 10.66 5.13zM14.75 12a2.75 2.75 0 1 1-5.5 0 2.75 2.75 0 0 1 5.5 0z"
        />
      </Duotone>
    </Icon>
  );
}

/** Trip interruption. */
export function RouteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="6" cy="18.5" r="2" />
        <circle cx="18" cy="6.5" r="2" />
      </Duotone>
      <path d="M8 18.5h7.5a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6H16" />
    </Icon>
  );
}

/** Pet coverage. */
export function PawIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M12 12.5c-2.9 0-5.5 3.3-5.5 5.6 0 1.4 1 2.2 2.3 2.2 1.2 0 2-.6 3.2-.6s2 .6 3.2.6c1.3 0 2.3-.8 2.3-2.2 0-2.3-2.6-5.6-5.5-5.6z" />
        <ellipse cx="9.4" cy="6.75" rx="1.6" ry="2.25" />
        <ellipse cx="14.6" cy="6.75" rx="1.6" ry="2.25" />
        <ellipse cx="5.25" cy="11" rx="1.5" ry="1.9" transform="rotate(-20 5.25 11)" />
        <ellipse cx="18.75" cy="11" rx="1.5" ry="1.9" transform="rotate(20 18.75 11)" />
      </Duotone>
    </Icon>
  );
}

/* Process */

/** "Quote in minutes." */
export function StopwatchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="13.5" r="7.5" />
      </Duotone>
      <path d="M10 2.75h4M12 2.75V6m5.6 1.9 1.6-1.6M12 13.5l2.75-2.75" />
    </Icon>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      </Duotone>
      <path d="M14 3v4a1 1 0 0 0 1 1h4M8.5 9H11m-2.5 3.5h7M8.5 16h7" />
    </Icon>
  );
}

/** Claims. */
export function ClipboardCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M9 4.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="3.5" rx="1" />
      </Duotone>
      <path d="m9 13.25 2.25 2.25 4-4.5" />
    </Icon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15M12 15.5V4M7.5 8.5 12 4l4.5 4.5" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <rect x="5" y="10.5" width="14" height="10" rx="2" />
      </Duotone>
      <path d="M8 10.5v-3a4 4 0 0 1 8 0v3m-4 4v2" />
    </Icon>
  );
}

/* Local */

/**
 * East Tennessee — the Smokies. No sun on purpose: mountains plus a sun is
 * the universal "image" placeholder glyph.
 */
export function MountainsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M2.5 19.5 9.5 7l7 12.5z" />
      </Duotone>
      <path d="M13.7 14.5 16 11l5.5 8.5h-5M7.09 11.3l1.2 1 1.21-1 1.21 1 1.2-1" />
    </Icon>
  );
}
