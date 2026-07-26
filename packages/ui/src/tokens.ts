/**
 * IyaLife Brand Tokens
 * Single source of truth for all design decisions.
 * Mother in gold. Baby in teal. Life in both.
 */

export const colors = {
  // Primary brand
  teal: {
    50:  "#C9E8EB",
    100: "#A5D7DC",
    200: "#75BDC4",
    300: "#4A9EA6",
    400: "#2B7F87",
    500: "#0B555C", // Institutional Teal — primary
    600: "#084045",
    700: "#052B2F",
    800: "#021719",
    900: "#063A40", // Dark Teal — headings
  },
  gold: {
    50:  "#E9CFAE",
    100: "#E2BE91",
    200: "#D8A461",
    300: "#C78735",
    400: "#9F6E2F",
    500: "#8F6734", // Warm Gold — accent
    600: "#644722",
    700: "#4C381F", // Dark Gold — emphasis
    800: "#2C2011",
    900: "#0C0905",
  },
  // Neutral
  ink:    "#1F2A2E", // Body text
  muted:  "#5B6B6E", // Metadata, captions
  border: "#D8C893", // Dividers
  surface:"#F8F7F4", // Background warmth
  white:  "#FFFFFF",
} as const;

export const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    serif: ["Playfair Display", "Georgia", "serif"],
  },
  fontSize: {
    xs:   ["0.75rem",  { lineHeight: "1rem" }],
    sm:   ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem",     { lineHeight: "1.5rem" }],
    lg:   ["1.125rem", { lineHeight: "1.75rem" }],
    xl:   ["1.25rem",  { lineHeight: "1.75rem" }],
    "2xl":["1.5rem",   { lineHeight: "2rem" }],
    "3xl":["1.875rem", { lineHeight: "2.25rem" }],
    "4xl":["2.25rem",  { lineHeight: "2.5rem" }],
  },
} as const;

// Tier system — precious elements
export const tiers = {
  silver: {
    label: "Silver",
    color: "#9CA3AF",
    bg:    "#F3F4F6",
    description: "Building her network",
  },
  gold: {
    label: "Gold",
    color: "#8F6734",
    bg:    "#E9CFAE",
    description: "Established earner",
  },
  diamond: {
    label: "Diamond",
    color: "#60A5FA",
    bg:    "#EFF6FF",
    description: "Community anchor",
  },
} as const;

export type Tier = keyof typeof tiers;
export type ColorScale = typeof colors.teal;
