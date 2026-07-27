export type PersonaKey = "silver" | "gold" | "diamond";

export interface DemoOrder {
  id: string;
  created_at: string;
  items: { name: string }[];
  total_amount: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
}

export interface DemoReferral {
  id: string;
  created_at: string;
  commission_total: number;
  referred: { full_name: string; total_orders: number; created_at: string };
}

export interface DemoMother {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  tier: PersonaKey;
  referral_code: string;
  member_number: number;
  total_earned: number;
  pending_earnings: number;
  paid_out: number;
  total_orders: number;
  total_referrals: number;
  bvn_verified: boolean;
  created_at: string;
  journey_stage: string;
  renewalConditionMet: boolean;
  orders: DemoOrder[];
  referrals: DemoReferral[];
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const DEMO_CREDENTIALS: Record<PersonaKey | "founder", { email: string; password: string }> = {
  silver:   { email: "amaka.demo@iyalife.co",  password: "demo1234" },
  gold:     { email: "ngozi.demo@iyalife.co",  password: "demo1234" },
  diamond:  { email: "bisi.demo@iyalife.co",   password: "demo1234" },
  founder:  { email: "founder.demo@iyalife.co", password: "demo1234" },
};

export const DEMO_PERSONAS: Record<PersonaKey, DemoMother> = {
  silver: {
    id: "demo-silver",
    full_name: "Amaka Obi",
    phone: "+2348012345601",
    email: "amaka.demo@iyalife.co",
    tier: "silver",
    referral_code: "AMAKA-2601",
    member_number: 742,
    total_earned: 4500,
    pending_earnings: 1200,
    paid_out: 3300,
    total_orders: 2,
    total_referrals: 3,
    bvn_verified: false,
    created_at: daysAgo(38),
    journey_stage: "newborn-0-6m",
    renewalConditionMet: true,
    orders: [
      { id: "demo-ord-s1", created_at: daysAgo(6),  items: [{ name: "Baby Wipes (6-pack)" }], total_amount: 8500, status: "delivered" },
      { id: "demo-ord-s2", created_at: daysAgo(29), items: [{ name: "Newborn Onesie Set" }, { name: "Diaper Rash Cream" }], total_amount: 12300, status: "delivered" },
    ],
    referrals: [
      { id: "demo-ref-s1", created_at: daysAgo(20), commission_total: 680,  referred: { full_name: "Funke A.",  total_orders: 1, created_at: daysAgo(20) } },
      { id: "demo-ref-s2", created_at: daysAgo(14), commission_total: 320,  referred: { full_name: "Chioma N.", total_orders: 0, created_at: daysAgo(14) } },
      { id: "demo-ref-s3", created_at: daysAgo(5),  commission_total: 200,  referred: { full_name: "Blessing O.", total_orders: 1, created_at: daysAgo(5) } },
    ],
  },
  gold: {
    id: "demo-gold",
    full_name: "Ngozi Eze",
    phone: "+2348012345602",
    email: "ngozi.demo@iyalife.co",
    tier: "gold",
    referral_code: "NGOZI-1143",
    member_number: 318,
    total_earned: 68000,
    pending_earnings: 8400,
    paid_out: 59600,
    total_orders: 9,
    total_referrals: 14,
    bvn_verified: true,
    created_at: daysAgo(210),
    journey_stage: "toddler-18m-3yr",
    renewalConditionMet: true,
    orders: [
      { id: "demo-ord-g1", created_at: daysAgo(3),  items: [{ name: "Multivitamin Gummies" }], total_amount: 6200, status: "confirmed" },
      { id: "demo-ord-g2", created_at: daysAgo(18), items: [{ name: "Toddler Snack Pack" }, { name: "Sippy Cup Set" }], total_amount: 9800, status: "delivered" },
      { id: "demo-ord-g3", created_at: daysAgo(45), items: [{ name: "Household Cleaning Bundle" }], total_amount: 15600, status: "delivered" },
    ],
    referrals: [
      { id: "demo-ref-g1", created_at: daysAgo(90),  commission_total: 4200, referred: { full_name: "Halima Y.", total_orders: 5, created_at: daysAgo(90) } },
      { id: "demo-ref-g2", created_at: daysAgo(60),  commission_total: 2100, referred: { full_name: "Grace T.",  total_orders: 3, created_at: daysAgo(60) } },
      { id: "demo-ref-g3", created_at: daysAgo(30),  commission_total: 1560, referred: { full_name: "Amina B.",  total_orders: 2, created_at: daysAgo(30) } },
      { id: "demo-ref-g4", created_at: daysAgo(9),   commission_total: 540,  referred: { full_name: "Ijeoma S.", total_orders: 1, created_at: daysAgo(9) } },
    ],
  },
  diamond: {
    id: "demo-diamond",
    full_name: "Bisi Adeyemi",
    phone: "+2348012345603",
    email: "bisi.demo@iyalife.co",
    tier: "diamond",
    referral_code: "BISI-4421",
    member_number: 47,
    total_earned: 412000,
    pending_earnings: 15600,
    paid_out: 396400,
    total_orders: 22,
    total_referrals: 41,
    bvn_verified: true,
    created_at: daysAgo(540),
    journey_stage: "growing-up-3-5yr",
    renewalConditionMet: true,
    orders: [
      { id: "demo-ord-d1", created_at: daysAgo(2),  items: [{ name: "Founding Deal Bundle" }], total_amount: 22400, status: "confirmed" },
      { id: "demo-ord-d2", created_at: daysAgo(11), items: [{ name: "School Prep Kit" }, { name: "Vitamin Pack" }], total_amount: 18900, status: "delivered" },
      { id: "demo-ord-d3", created_at: daysAgo(33), items: [{ name: "Household Essentials Bundle" }], total_amount: 27300, status: "delivered" },
      { id: "demo-ord-d4", created_at: daysAgo(70), items: [{ name: "Maternal Health Bundle" }], total_amount: 19500, status: "delivered" },
    ],
    referrals: [
      { id: "demo-ref-d1", created_at: daysAgo(400), commission_total: 31200, referred: { full_name: "Tolu K.",   total_orders: 12, created_at: daysAgo(400) } },
      { id: "demo-ref-d2", created_at: daysAgo(310), commission_total: 24800, referred: { full_name: "Ronke A.",  total_orders: 9,  created_at: daysAgo(310) } },
      { id: "demo-ref-d3", created_at: daysAgo(180), commission_total: 12400, referred: { full_name: "Zainab M.", total_orders: 6,  created_at: daysAgo(180) } },
      { id: "demo-ref-d4", created_at: daysAgo(75),  commission_total: 6100,  referred: { full_name: "Peace E.",  total_orders: 3,  created_at: daysAgo(75) } },
      { id: "demo-ref-d5", created_at: daysAgo(21),  commission_total: 1800,  referred: { full_name: "Uche F.",   total_orders: 1,  created_at: daysAgo(21) } },
    ],
  },
};

// Shared, non-secret token used only to hand off the Founder persona from
// the marketing site to the separately-deployed admin app. This is a demo
// convenience, not real auth — the admin app has no real backend either.
export const DEMO_HANDOFF_TOKEN = "iyalife-demo-2026";
export const DEMO_ADMIN_URL = "https://iyalife-admin.vercel.app";

export interface PersonaCard {
  key: PersonaKey | "founder";
  name: string;
  role: string;
  description: string;
}

export const PERSONA_CARDS: PersonaCard[] = [
  { key: "silver",  name: DEMO_PERSONAS.silver.full_name,  role: "Silver Mother",   description: "New member, building her network" },
  { key: "gold",    name: DEMO_PERSONAS.gold.full_name,    role: "Gold Mother",     description: "Established earner, active referrer" },
  { key: "diamond", name: DEMO_PERSONAS.diamond.full_name, role: "Diamond Mother",  description: "Top-tier earner, community anchor" },
  { key: "founder", name: "Founder Admin",                 role: "Founder / Admin", description: "Operates the admin dashboard" },
];

const COOKIE_NAME = "iyalife_demo";

export function setDemoSessionCookie(persona: PersonaKey) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${persona}; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
}

export function clearDemoSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getDemoPersonaKeyFromClient(): PersonaKey | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value && value in DEMO_PERSONAS ? (value as PersonaKey) : null;
}

export function getDemoPersonaKeyFromCookieHeader(cookieValue: string | undefined): PersonaKey | null {
  return cookieValue && cookieValue in DEMO_PERSONAS ? (cookieValue as PersonaKey) : null;
}
