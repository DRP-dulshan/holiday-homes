import type { ComponentType } from "react";
import {
  IconBag,
  IconBall,
  IconBroom,
  IconCar,
  IconElevator,
  IconEye,
  IconFlame,
  IconGym,
  IconHeadset,
  IconLaptop,
  IconLeaf,
  IconLock,
  IconParking,
  IconPaw,
  IconPool,
  IconShield,
  IconSmartHome,
  IconSnowflake,
  IconSofa,
  IconSteam,
  IconUtensils,
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
  | "furnished"
  | "airCon"
  | "kitchen"
  | "sauna"
  | "steamRoom"
  | "bbq"
  | "smartLock"
  | "mallAccess"
  | "basketball";

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
  parking: { label: "Free parking", icon: IconParking },
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
  airCon: { label: "Air conditioning", icon: IconSnowflake },
  kitchen: { label: "Fully equipped kitchen", icon: IconUtensils },
  sauna: { label: "Sauna", icon: IconFlame },
  steamRoom: { label: "Steam room", icon: IconSteam },
  bbq: { label: "BBQ area", icon: IconFlame },
  smartLock: { label: "Smart-lock self check-in", icon: IconLock },
  mallAccess: { label: "Direct mall access", icon: IconBag },
  basketball: { label: "Basketball court", icon: IconBall },
};
