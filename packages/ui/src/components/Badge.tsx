import React from "react";
import { cn } from "../utils";
import type { Tier } from "../tokens";

export type BadgeVariant = "default" | "teal" | "gold" | "success" | "warning" | "danger"
  | "tier-silver" | "tier-gold" | "tier-diamond";

const variants: Record<BadgeVariant, string> = {
  default:       "bg-brand-surface text-brand-muted border border-brand-border",
  teal:          "bg-brand-teal-light text-brand-teal-dark border border-brand-teal/20",
  gold:          "bg-brand-gold-light text-brand-gold-dark border border-brand-gold/30",
  success:       "bg-green-50 text-green-800 border border-green-200",
  warning:       "bg-amber-50 text-amber-800 border border-amber-200",
  danger:        "bg-red-50 text-red-700 border border-red-200",
  "tier-silver": "bg-gray-100 text-gray-600 border border-gray-300 font-semibold",
  "tier-gold":   "bg-brand-gold-light text-brand-gold-dark border border-brand-gold/40 font-semibold",
  "tier-diamond":"bg-blue-50 text-blue-700 border border-blue-200 font-semibold",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: Tier }) {
  const variantMap: Record<Tier, BadgeVariant> = {
    silver:  "tier-silver",
    gold:    "tier-gold",
    diamond: "tier-diamond",
  };
  const labels: Record<Tier, string> = {
    silver:  "◆ Silver",
    gold:    "◆ Gold",
    diamond: "◆ Diamond",
  };
  return <Badge variant={variantMap[tier]}>{labels[tier]}</Badge>;
}
