import React from "react";
import { cn } from "../utils";
import { Card } from "./Card";

export interface MetricCardProps {
  label:     string;
  value:     string | number;
  unit?:     string;
  change?:   number;      // percentage change
  type?:     "commercial" | "mission";
  icon?:     React.ReactNode;
  className?: string;
}

export function MetricCard({
  label, value, unit, change, type = "commercial", icon, className,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const typeColor   = type === "mission" ? "text-brand-gold-dark" : "text-brand-teal";
  const typeBorder  = type === "mission" ? "border-t-2 border-t-brand-gold" : "border-t-2 border-t-brand-teal";

  return (
    <Card
      variant="elevated"
      className={cn("flex flex-col gap-3", typeBorder, className)}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm text-brand-muted font-medium">{label}</span>
        {icon && <span className={cn("opacity-70", typeColor)}>{icon}</span>}
      </div>
      <div className="flex items-end gap-1.5">
        <span className={cn("text-3xl font-bold", typeColor)}>
          {value}
        </span>
        {unit && <span className="text-sm text-brand-muted mb-1">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className={cn(
          "text-xs font-medium",
          isPositive ? "text-green-600" : "text-red-500",
        )}>
          {isPositive ? "↑" : "↓"} {Math.abs(change)}% vs last period
        </div>
      )}
      <div className={cn(
        "text-xs uppercase tracking-wide font-semibold",
        type === "mission" ? "text-brand-gold/70" : "text-brand-teal/60",
      )}>
        {type === "mission" ? "Mission metric" : "Commercial metric"}
      </div>
    </Card>
  );
}
