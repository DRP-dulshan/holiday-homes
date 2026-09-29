import type { ComponentType } from "react";
import {
  IconBroom,
  IconCar,
  IconElevator,
  IconEye,
  IconGym,
  IconHeadset,
  IconLaptop,
  IconLeaf,
  IconParking,
  IconPaw,
  IconPool,
  IconShield,
  IconSmartHome,
  IconSofa,
  IconWasher,
  IconWaves,
  IconWifi,
  type IconProps,
} from "@/components/icons";

export type AmenityId =
  | "pool"
  | "sharedPool"
  | "seaView"
  | "marinaView"
  | "skylineView"
  | "canalView"
  | "garden"
  | "parking"
  | "gym"
  | "beachAccess"
  | "wifi"
  | "washer"
  | "workspace"
  | "petsAllowed"
  | "concierge"
  | "carFleet"
  | "housekeeping"
  | "security"
  | "elevator"
  | "smartHome"
  | "furnished";

export const AMENITIES: Record<
  AmenityId,
  { label: string; icon: ComponentType<IconProps> }
> = {
  pool: { label: "Private pool", icon: IconPool },
  sharedPool: { label: "Shared pool", icon: IconPool },
  seaView: { label: "Sea view", icon: IconWaves },
  marinaView: { label: "Marina view", icon: IconWaves },
  skylineView: { label: "Skyline / Burj view", icon: IconEye },
  canalView: { label: "Canal view", icon: IconEye },
  garden: { label: "Private garden", icon: IconLeaf },
  parking: { label: "Private parking", icon: IconParking },
  gym: { label: "Shared gym", icon: IconGym },
  beachAccess: { label: "Beach access", icon: IconWaves },
  wifi: { label: "Fast Wi-Fi", icon: IconWifi },
  washer: { label: "Washer & dryer", icon: IconWasher },
  workspace: { label: "Dedicated workspace", icon: IconLaptop },
  petsAllowed: { label: "Pets allowed", icon: IconPaw },
  concierge: { label: "Concierge on call", icon: IconHeadset },
  carFleet: { label: "DRP car fleet", icon: IconCar },
  housekeeping: { label: "Housekeeping included", icon: IconBroom },
  security: { label: "24/7 security", icon: IconShield },
  elevator: { label: "Direct elevator access", icon: IconElevator },
  smartHome: { label: "Smart home controls", icon: IconSmartHome },
  furnished: { label: "Designer furnished", icon: IconSofa },
};
