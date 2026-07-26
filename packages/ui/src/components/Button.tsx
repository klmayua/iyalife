import React from "react";
import { cn } from "../utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "gold" | "danger";
export type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:   "bg-brand-teal text-white hover:bg-brand-teal-dark active:scale-[0.98] shadow-brand",
  secondary: "bg-white text-brand-teal border border-brand-teal hover:bg-brand-teal/5",
  ghost:     "bg-transparent text-brand-teal hover:bg-brand-teal/8",
  gold:      "bg-brand-gold text-white hover:bg-brand-gold-dark active:scale-[0.98] shadow-gold",
  danger:    "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-base rounded-brand",
  lg: "px-7 py-3.5 text-lg rounded-brand",
};

export function Button({
  variant  = "primary",
  size     = "md",
  loading  = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium",
        "transition-all duration-150 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
