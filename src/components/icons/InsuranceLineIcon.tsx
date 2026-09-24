import type { ComponentType } from "react";
import type { InsuranceLine } from "@/lib/config/agency";
import type { IconProps } from "@/components/icons/Icon";
import {
  BoatIcon,
  CabinIcon,
  CamperIcon,
  CarIcon,
  ClassicCarIcon,
  GroupIcon,
  HandHeartIcon,
  HouseFrameIcon,
  HouseIcon,
  LaptopLockIcon,
  MotorcycleIcon,
  OfficeBuildingIcon,
  ShieldIcon,
  ShieldPersonIcon,
  StorefrontIcon,
  ToolsIcon,
  TruckIcon,
  UmbrellaIcon,
  WorkerIcon,
} from "@/components/icons/coverage";

/**
 * A full Record, so adding a line to `insuranceLines` fails the type check
 * until it has an icon.
 */
export const insuranceLineIcons: Record<InsuranceLine, ComponentType<IconProps>> = {
  auto: CarIcon,
  home: HouseIcon,
  business: StorefrontIcon,
  "general-liability": ShieldPersonIcon,
  "workers-comp": WorkerIcon,
  "commercial-property": OfficeBuildingIcon,
  "builders-risk": HouseFrameIcon,
  "commercial-auto": TruckIcon,
  "commercial-umbrella": UmbrellaIcon,
  contractors: ToolsIcon,
  "group-life": GroupIcon,
  life: HandHeartIcon,
  "collector-vehicle": ClassicCarIcon,
  boat: BoatIcon,
  motorcycle: MotorcycleIcon,
  rv: CamperIcon,
  "rental-property": CabinIcon,
  cyber: LaptopLockIcon,
  other: ShieldIcon,
};

/** For data-driven markup, e.g. `<InsuranceLineIcon line={page.insuranceLine} />`. */
export function InsuranceLineIcon({ line, ...props }: IconProps & { line: InsuranceLine }) {
  const LineIcon = insuranceLineIcons[line];
  return <LineIcon {...props} />;
}
