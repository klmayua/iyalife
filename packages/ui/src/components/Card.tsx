import React from "react";
import { cn } from "../utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "gold" | "teal";
  padding?: "none" | "sm" | "md" | "lg";
}

const variants = {
  default:  "bg-white border border-brand-border",
  elevated: "bg-white shadow-brand border border-brand-border/40",
  gold:     "bg-brand-gold-light border border-brand-gold/30",
  teal:     "bg-brand-teal-light border border-brand-teal/30",
};

const paddings = {
  none: "",
  sm:   "p-3",
  md:   "p-5",
  lg:   "p-7",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-brand transition-shadow",
        variants[variant],
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 pb-4 border-b border-brand-border", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-brand-teal-dark", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-brand-ink", className)} {...props}>
      {children}
    </div>
  );
}
