import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../lib/supabase";

export const prerender = false;

const MIN_PAYOUT = 500;

function nextFriday(): string {
  const d = new Date();
  const daysUntilFriday = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilFriday);
  return d.toISOString().slice(0, 10);
}

export const POST: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServerClient(cookies);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const { data: mother } = await supabase
    .from("mothers")
    .select("id, pending_earnings, bvn_verified")
    .eq("id", session.user.id)
    .single();

  if (!mother) {
    return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404 });
  }

  if (!mother.bvn_verified) {
    return new Response(
      JSON.stringify({ error: "Verify your identity before requesting a payout." }),
      { status: 400 },
    );
  }

  if ((mother.pending_earnings ?? 0) < MIN_PAYOUT) {
    return new Response(
      JSON.stringify({ error: `Minimum payout amount is ₦${MIN_PAYOUT}.` }),
      { status: 400 },
    );
  }

  const { error } = await supabase.from("commission_payouts").insert({
    mother_id:  mother.id,
    amount:     mother.pending_earnings,
    period_end: nextFriday(),
    status:     "pending",
  });

  if (error) {
    return new Response(JSON.stringify({ error: "Could not queue payout. Please try again." }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ message: "Payout requested. It will be processed this Friday." }),
    { status: 200 },
  );
};
