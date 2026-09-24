import { Duotone, Icon, type IconProps } from "@/components/icons/Icon";

/*
 * One drawing per insurance line (see line-icons.ts for the mapping).
 * Vehicles share a side profile facing right, with wheels centred on the
 * body's bottom line.
 */

/** Shared by ShieldIcon, ShieldPersonIcon and ShieldCheckIcon. */
export const shieldOutline =
  "M12 2.75c2.4 1.3 4.9 2 7.25 2.1V11c0 4.9-3.1 8.7-7.25 10.25C7.85 19.7 4.75 15.9 4.75 11V4.85c2.35-.1 4.85-.8 7.25-2.1z";

/* Vehicles */

export function CarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" d="M6.5 11 8.9 7.8a2 2 0 0 1 1.6-.8H14a2 2 0 0 1 1.52.7L18.5 11z" />
      </Duotone>
      <path d="M5 16.5H3.5a1 1 0 0 1-1-1V13a1.5 1.5 0 0 1 1.2-1.47L6.5 11l2.4-3.2a2 2 0 0 1 1.6-.8H14a2 2 0 0 1 1.52.7L18.5 11l2.1.5a1.5 1.5 0 0 1 .9 1.38v2.62a1 1 0 0 1-1 1H19M9 16.5h6M6.5 11h12m-6.25-4v4" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
    </Icon>
  );
}

/**
 * The collector-vehicle flagship: a vintage roadster with flowing fenders,
 * deliberately a different silhouette from CarIcon so the two never blur.
 */
export function ClassicCarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M3.25 16.75h-.5a.75.75 0 0 1-.75-.75v-1.25C2 13 3.6 11.75 6.25 11.75c1.6 0 2.6.75 3.4.75h2.1c1.4 0 2.9-.75 5.25-.75 2.9 0 4.5 1.35 4.5 3.25V16a.75.75 0 0 1-.75.75 3.25 3.25 0 0 0-6.5 0h-4.5a3.25 3.25 0 0 0-6.5 0z" />
      </Duotone>
      <path d="m11.5 12.5 1.5-3.5m-4.75 3.25v-.5A1.75 1.75 0 0 1 10 10" />
      <circle cx="6.5" cy="16.75" r="2.25" />
      <circle cx="17.5" cy="16.75" r="2.25" />
      <path d="M6.5 16.75h.01m10.99 0h.01" />
    </Icon>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" d="M2.5 6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v11H9.25a2.75 2.75 0 0 0-5.5 0H2.5z" />
      </Duotone>
      <path d="M4.5 17h-1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v11m-6 0h7" />
      <path d="M14.5 9h3.9a1 1 0 0 1 .78.37l2.1 2.63a1 1 0 0 1 .22.63V16a1 1 0 0 1-1 1h-1m-5-4.25h7" />
      <circle cx="6.5" cy="17" r="2" />
      <circle cx="17.5" cy="17" r="2" />
    </Icon>
  );
}

export function BoatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M3 12.5h18.25l-2.9 3.9a2 2 0 0 1-1.6.85H6.4a2 2 0 0 1-1.8-1.1z" />
      </Duotone>
      <path d="M7.5 12.5V10a1 1 0 0 1 1-1h4l3 3.5" />
      <path d="M2.5 20.25c1.25 0 1.75-1 3-1s1.75 1 3 1 1.75-1 3-1 1.75 1 3 1 1.75-1 3-1 1.75 1 3 1" />
    </Icon>
  );
}

export function MotorcycleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M3.75 11.25h6.5l1.5-1.5h3.5l.5 2.5-2.25 3.5h-3.25L8.5 13H5.25z" />
      </Duotone>
      <path d="M14 7.75h2.25m-1 0 3.25 8.25M5.5 16l2.1-3" />
      <circle cx="5.5" cy="16" r="3" />
      <circle cx="18.5" cy="16" r="3" />
      <path d="M5.5 16h.01m12.99 0h.01" />
    </Icon>
  );
}

/** RVs and travel trailers — the duotone fill is the classic two-tone paint. */
export function CamperIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" d="M2.5 12.5V16a1 1 0 0 0 1 1h3.75a2.75 2.75 0 0 1 5.5 0h5a1 1 0 0 0 1-1v-3.5z" />
      </Duotone>
      <path d="M8 17H3.5a1 1 0 0 1-1-1v-5C2.5 7.7 4.7 5.5 8 5.5h5c3.3 0 5.75 2.4 5.75 5.5v5a1 1 0 0 1-1 1H12m6.75-2h2.75M2.5 12.5H14m2.5 0h2.25" />
      <rect x="5" y="8" width="4" height="2.5" rx=".75" />
      <path d="M14 17v-6.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75V17" />
      <circle cx="10" cy="17" r="2" />
    </Icon>
  );
}

/* Property */

export function HouseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" d="M5 9.14 12 3.5l7 5.64V20.5H5z" />
      </Duotone>
      <path d="M3 10.75 12 3.5l9 7.25M5 9.14V19.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.14" />
      <path d="M10 20.5v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5M16 6.72V4.5h2v3.83" />
    </Icon>
  );
}

/** A-frame cabin — short-term rentals, vacation and lake homes. */
export function CabinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" fillRule="evenodd" d="M3 20.5 12 3.5l9 17zm2.83 0h12.34L12 8.85z" />
      </Duotone>
      <path d="M3 20.5 12 3.5l9 17zm2.83 0L12 8.85l6.17 11.65" />
      <path d="M10.5 20.5v-3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v3.75" />
    </Icon>
  );
}

export function StorefrontIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M3.5 9.5 5 4.5h14l1.5 5a2.125 2.125 0 0 1-4.25 0 2.125 2.125 0 0 1-4.25 0 2.125 2.125 0 0 1-4.25 0 2.125 2.125 0 0 1-4.25 0z" />
      </Duotone>
      <path d="m7.75 9.5.75-5M12 9.5v-5m4.25 5-.75-5M5 13v7.5m14-7.5v7.5M3 20.5h18" />
      <path d="M7.5 20.5v-4.75a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75v4.75" />
      <rect x="13.5" y="15" width="3.5" height="3" rx=".75" />
    </Icon>
  );
}

/** Commercial property: a tall office block beside a low one. */
export function OfficeBuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M4.5 20.5V5A1.5 1.5 0 0 1 6 3.5h7A1.5 1.5 0 0 1 14.5 5v15.5" />
      </Duotone>
      <path d="M14.5 9.5h4A1.5 1.5 0 0 1 20 11v9.5M3 20.5h18.5" />
      <path d="M7.25 7h1m2.5 0h1m-4.5 3.5h1m2.5 0h1M7.25 14h1m2.5 0h1m5-1h1m-1 3.5h1M8 20.5v-3h3v3" />
    </Icon>
  );
}

/**
 * Builder's risk: timber framing mid-build. The diagonal brace and the door
 * rough-opening keep it from reading as a columned (bank) facade.
 */
export function HouseFrameIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path stroke="none" d="M5 11V9.5L12 4l7 5.5V11z" />
      </Duotone>
      <path d="M2.5 11.5 12 4l9.5 7.5M5 11h14M12 4v7m-7 0v9.5m7-9.5v9.5m7-9.5v9.5m-15.5 0h17M5 20.5 12 11m2.75 9.5v-5.25h2.5v5.25" />
    </Icon>
  );
}

/* Business & liability */

export function UmbrellaIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M3 12a9 9 0 0 1 18 0 4.5 4.5 0 0 0-6 0 4.5 4.5 0 0 0-6 0 4.5 4.5 0 0 0-6 0z" />
      </Duotone>
      <path d="M12 3c-2 2.5-3 5.5-3 9m3-9c2 2.5 3 5.5 3 9m-3-1.15v7.9a1.75 1.75 0 0 1-3.5 0" />
    </Icon>
  );
}

/** General liability: protecting the people around your business. */
export function ShieldPersonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d={shieldOutline} />
      </Duotone>
      <circle cx="12" cy="8.75" r="2" />
      <path d="M8.25 16.25c.5-1.9 2-3.1 3.75-3.1s3.25 1.2 3.75 3.1" />
    </Icon>
  );
}

/** Workers' comp: an employee in a hard hat. */
export function WorkerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M7.5 9.5V9a4.5 4.5 0 0 1 9 0v.5" />
      </Duotone>
      <path d="M5.75 9.5h12.5M12 4.5V7M8.5 9.5a3.5 3.5 0 0 0 7 0M4.75 20.75c0-3.2 3.25-5.25 7.25-5.25s7.25 2.05 7.25 5.25" />
    </Icon>
  );
}

/** Contractors: crossed hammer and wrench. */
export function ToolsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M13.23 5.11 18.89 10.77 16.77 12.89 11.11 7.23z" />
        <path d="M6.26 4.49A3.25 3.25 0 1 1 4.49 6.26L6.62 8.38 8.38 6.62z" />
      </Duotone>
      <path d="M4.75 19.25 13.94 10.06M9.8 9.8l9.45 9.45" />
    </Icon>
  );
}

/** Cyber liability. */
export function LaptopLockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <rect x="4" y="4.5" width="16" height="11" rx="1.5" />
      </Duotone>
      <path d="M2.5 18.5 4 15.5h16l1.5 3a1 1 0 0 1-.9 1.5H3.4a1 1 0 0 1-.9-1.5z" />
      <path d="M10.25 9.5V8.25a1.75 1.75 0 0 1 3.5 0V9.5M12 11.5v.01" />
      <rect x="9" y="9.5" width="6" height="4" rx="1" />
    </Icon>
  );
}

/** Generic coverage — the fallback for lines without their own drawing. */
export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d={shieldOutline} />
      </Duotone>
    </Icon>
  );
}

/* Life */

export function HandHeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M12.5 12.9 9.57 9.63A1.85 1.85 0 1 1 12.5 7.39a1.85 1.85 0 1 1 2.93 2.24z" />
      </Duotone>
      <path d="M2.5 15.5h4.75c.8 0 1.55.3 2.1.85l.8.8h2.6a1.25 1.25 0 0 1 0 2.5H9.5M2.5 20.25h10.25c.9 0 1.75-.3 2.45-.85l4.45-3.55a1.35 1.35 0 0 0-1.65-2.1l-2.75 1.95" />
    </Icon>
  );
}

/** Group life: a team covered together. */
export function GroupIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="8" r="2.75" />
        <path d="M6.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      </Duotone>
      <circle cx="5" cy="9.5" r="2" />
      <circle cx="19" cy="9.5" r="2" />
      <path d="M2.25 19.5c0-2.6 1.6-4.5 4-4.75m15.5 4.75c0-2.6-1.6-4.5-4-4.75" />
    </Icon>
  );
}
