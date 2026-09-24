import { Duotone, Icon, type IconProps } from "@/components/icons/Icon";

/* Navigation */

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 15 6-6 6 6" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15 6-6 6 6 6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 12h-15m6-6-6 6 6 6" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15m-6-6 6 6-6 6" />
    </Icon>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </Icon>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 4.5h6v6m0-6-8.25 8.25" />
      <path d="M18 13.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V7.5A1.5 1.5 0 0 1 6 6h4.5" />
    </Icon>
  );
}

/* Status */

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="12" r="9" />
      </Duotone>
      <path d="m8.5 12.25 2.5 2.5 4.75-5.25" />
    </Icon>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="12" r="9" />
      </Duotone>
      <path d="M12 7.75v5m0 3.5v.01" />
    </Icon>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M10.7 6a1.5 1.5 0 0 1 2.6 0l6.65 11.5a1.5 1.5 0 0 1-1.3 2.25H5.35a1.5 1.5 0 0 1-1.3-2.25z" />
      </Duotone>
      <path d="M12 9.75V14m0 2.75v.01" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="12" r="9" />
      </Duotone>
      <path d="M12 11v5.25m0-8.5v.01" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14m-7-7h14" />
    </Icon>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="10.75" cy="10.75" r="6.25" />
      </Duotone>
      <path d="m15.25 15.25 4.75 4.75" />
    </Icon>
  );
}

/** Pair with `animate-spin`. */
export function LoaderIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Icon>
  );
}

/* Contact & communication */

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M5.5 4h2.6a1 1 0 0 1 .95.68l1.05 3.2a1 1 0 0 1-.3 1.08L8.3 10.2a11 11 0 0 0 5.5 5.5l1.24-1.5a1 1 0 0 1 1.08-.3l3.2 1.05a1 1 0 0 1 .68.95v2.6a1.5 1.5 0 0 1-1.5 1.5H17A13 13 0 0 1 4 7V5.5A1.5 1.5 0 0 1 5.5 4z" />
      </Duotone>
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <rect x="3" y="5" width="18" height="14" rx="2" />
      </Duotone>
      <path d="m3.5 6.75 7.6 5.7a1.5 1.5 0 0 0 1.8 0l7.6-5.7" />
    </Icon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M12 21.25s-7-5.9-7-11.5a7 7 0 0 1 14 0c0 5.6-7 11.5-7 11.5z" />
      </Duotone>
      <circle cx="12" cy="9.75" r="2.5" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="12" r="9" />
      </Duotone>
      <path d="M12 7.5V12l3 2" />
    </Icon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M3.5 10V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v3" />
      </Duotone>
      <path d="M20.5 10v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V10m0 0h17M8 3.25v3.5m8-3.5v3.5" />
      <path d="M8 13.75h.01m3.99 0h.01m3.99 0h.01M8 17h.01m3.99 0h.01" />
    </Icon>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M5.04 15.41A8.5 7.25 0 1 1 9.09 18.06L4 20z" />
      </Duotone>
      <path d="M8.25 11.25h.01m3.74 0h.01m3.74 0h.01" />
    </Icon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M20.5 12 4 4.5l2.75 7.5L4 19.5z" />
      </Duotone>
      <path d="M6.75 12h5" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="12" cy="7.75" r="3.5" />
        <path d="M4.75 20.25c0-3.6 3.25-6.5 7.25-6.5s7.25 2.9 7.25 6.5" />
      </Duotone>
    </Icon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 19.75c0-3.3 2.7-5.75 6-5.75s6 2.45 6 5.75" />
      </Duotone>
      <path d="M16 5.5a2.75 2.75 0 0 1 0 5.5m1.25 3.3c2.2.45 3.75 2.6 3.75 5.2v.25" />
    </Icon>
  );
}

/** "Talk to an agent." */
export function HeadsetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.5 12.5V11a6.5 6.5 0 0 1 13 0v1.5m0 6v.25a2.75 2.75 0 0 1-2.75 2.75H13.5" />
      <Duotone>
        <rect x="3.5" y="12.5" width="4" height="6" rx="1.5" />
        <rect x="16.5" y="12.5" width="4" height="6" rx="1.5" />
      </Duotone>
    </Icon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Duotone>
        <path d="M12 3.4 14.41 9.58 21.04 9.96 15.9 14.17 17.58 20.59 12 17 6.42 20.59 8.1 14.17 2.96 9.96 9.59 9.58z" />
      </Duotone>
    </Icon>
  );
}
