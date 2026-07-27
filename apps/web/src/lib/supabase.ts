import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";

const supabaseUrl  = import.meta.env.PUBLIC_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

// supabase-js eagerly constructs a WebSocket-capable realtime transport at
// client-creation time, even though this app never opens a realtime channel.
// Node < 22 has no native WebSocket global, which crashes SSR/prerendering.
// This stub is only ever instantiated if .channel() is called, which we
// never do — safe to leave inert.
class NoopSocket {
  constructor(_url: string, _protocols?: string | string[]) {}
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}
const realtimeOptions =
  typeof WebSocket === "undefined"
    ? { transport: NoopSocket as unknown as typeof WebSocket }
    : undefined;

// Browser client — used inside client:load islands and <script> tags.
// Persists the session to cookies (not localStorage) so the SSR middleware
// can read it on the next request.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  realtime: realtimeOptions,
});

// Server client — used in middleware and .astro frontmatter, reads/writes
// the session via Astro.cookies so auth state is available during SSR.
export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient(supabaseUrl, supabaseKey, {
    realtime: realtimeOptions,
    cookies: {
      get(key: string) {
        return cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        cookies.set(key, value, options);
      },
      remove(key: string, options: CookieOptions) {
        cookies.delete(key, options);
      },
    },
  });
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getMother(userId: string) {
  const { data } = await supabase
    .from("mothers")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/auth/login";
}

// ── Referral helpers ──────────────────────────────────────────────────────────
export async function getReferrerByCode(code: string) {
  const { data } = await supabase
    .from("mothers")
    .select("id, full_name, referral_code, tier")
    .eq("referral_code", code)
    .single();
  return data;
}

export async function validateReferralCode(code: string): Promise<boolean> {
  const referrer = await getReferrerByCode(code);
  return !!referrer;
}

// ── Product helpers ───────────────────────────────────────────────────────────
export async function getProducts(category?: string, limit = 12) {
  let query = supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return data ?? [];
}

export async function getProductCategoryCounts(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("in_stock", true);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}

export async function getProduct(slug: string) {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4) {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("in_stock", true)
    .neq("id", excludeId)
    .limit(limit);
  return data ?? [];
}
