import React from "react";
import { cn } from "../utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  hint?:    string;
  error?:   string;
  leading?: React.ReactNode;
}

export function Input({
  label,
  hint,
  error,
  leading,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-brand-ink"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leading && (
          <div className="absolute inset-y-0 left-3 flex items-center
            pointer-events-none text-brand-muted">
            {leading}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-brand border px-3 py-2.5 text-brand-ink",
            "bg-white placeholder:text-brand-muted/60",
            "transition-colors focus:outline-none",
            "focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-brand-border hover:border-brand-teal/50",
            leading && "pl-9",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-brand-muted">{hint}</p>}
    </div>
  );
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  hint?:    string;
  error?:   string;
  options:  { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label, hint, error, options, placeholder, className, id, ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-brand-ink">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full rounded-brand border px-3 py-2.5 text-brand-ink bg-white",
          "transition-colors focus:outline-none",
          "focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20",
          error ? "border-red-400" : "border-brand-border hover:border-brand-teal/50",
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-brand-muted">{hint}</p>}
    </div>
  );
}
