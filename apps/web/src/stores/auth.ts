import { atom } from "nanostores";
import type { User } from "@supabase/supabase-js";

export interface Mother {
  id:               string;
  full_name:        string;
  phone:            string;
  email?:           string;
  tier:             "silver" | "gold" | "diamond";
  referral_code:    string;
  member_number:    number;
  is_founding:      boolean;
  total_earned:     number;
  total_orders:     number;
  referred_by?:     string;
  journey_stage?:   string;
  created_at:       string;
}

export const currentUser   = atom<User | null>(null);
export const currentMother = atom<Mother | null>(null);
export const isLoading     = atom<boolean>(true);

export const tierColors = {
  silver:  { bg: "bg-gray-100",           text: "text-gray-700",      border: "border-gray-300"         },
  gold:    { bg: "bg-amber-50",           text: "text-amber-700",     border: "border-amber-300"        },
  diamond: { bg: "bg-blue-50",            text: "text-blue-700",      border: "border-blue-300"         },
} as const;

export const tierLabels = {
  silver:  "◆ Silver",
  gold:    "◆ Gold",
  diamond: "◆ Diamond",
} as const;
