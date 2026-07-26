import { cn } from "../utils";

export interface LogoProps {
  size?:      number;
  className?: string;
}

/**
 * IyaLife wordmark. "Iya" gold, "Life" teal — official brand asset,
 * served from each app's public/logo.png.
 */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="IyaLife"
      style={{ height: size }}
      className={cn("w-auto object-contain", className)}
    />
  );
}
