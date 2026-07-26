import { Badge } from "@iyalife/ui";
import { DataTable } from "../components/DataTable";
import { supabase, useQuery, fmt, fmtDate } from "../hooks/useSupabase";

export default function Referrals() {
  const { data: referrals, loading, refetch } = useQuery(async () =>
    supabase
      .from("referrals")
      .select(`
        *,
        referrer:referrer_id(full_name, tier, referral_code),
        referred:referred_id(full_name, phone, total_orders)
      `)
      .order("created_at", { ascending: false }),
    [],
  );

  const { data: pending } = useQuery(async () =>
    supabase
      .from("commission_payouts")
      .select("*, mother:mother_id(full_name)")
      .eq("status", "pending")
      .order("amount", { ascending: false }),
    [],
  );

  const approvePayout = async (id: string) => {
    await supabase
      .from("commission_payouts")
      .update({ status: "approved" })
      .eq("id", id);
    refetch();
  };

  const totalCommissions = (referrals ?? []).reduce(
    (s, r) => s + (r.commission_total ?? 0), 0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-teal-dark">Referrals</h1>
        <p className="text-brand-muted text-sm mt-1">Referral network, commissions, and payout queue</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Total referrals", val: (referrals ?? []).length, color:"text-brand-teal" },
          { label:"Total commissions", val: fmt(totalCommissions), color:"text-brand-gold-dark" },
          { label:"Pending payouts", val: (pending ?? []).length, color:"text-amber-600" },
        ].map(s => (
          <div key={s.label} className="rounded-brand border border-brand-border bg-white p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-brand-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending payouts */}
      {(pending ?? []).length > 0 && (
        <div className="rounded-brand border border-amber-200 bg-amber-50 p-5 flex flex-col gap-3">
          <h2 className="font-bold text-amber-800 text-sm">Pending Payouts — Approve for Friday processing</h2>
          {(pending ?? []).slice(0, 5).map(p => (
            <div key={p.id}
              className="flex items-center justify-between gap-4 bg-white rounded-md p-3
                border border-amber-200">
              <div>
                <p className="text-sm font-medium text-brand-ink">{p.mother?.full_name}</p>
                <p className="text-xs text-brand-muted">Week ending {fmtDate(p.period_end)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand-gold-dark">{fmt(p.amount)}</span>
                <button
                  onClick={() => approvePayout(p.id)}
                  className="px-3 py-1.5 rounded-md bg-brand-teal text-white text-xs
                    font-semibold hover:bg-brand-teal-dark transition-colors">
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Referral network */}
      <DataTable
        loading={loading}
        empty="No referral relationships yet."
        data={referrals ?? []}
        columns={[
          { key:"referrer", label:"Referrer", render: r => (
            <div>
              <p className="font-medium text-brand-ink text-sm">{r.referrer?.full_name ?? "—"}</p>
              <p className="text-xs text-brand-muted">{r.referrer?.tier} · {r.referrer?.referral_code}</p>
            </div>
          )},
          { key:"referred", label:"Referred", render: r => (
            <div>
              <p className="font-medium text-brand-ink text-sm">{r.referred?.full_name ?? "—"}</p>
              <p className="text-xs text-brand-muted">{r.referred?.phone}</p>
            </div>
          )},
          { key:"referral_type", label:"Type", render: r => (
            <Badge variant={r.referral_type === "advocate" ? "gold" : "teal"}>
              {r.referral_type ?? "peer"}
            </Badge>
          )},
          { key:"commission_total", label:"Earned", align:"right", render: r => (
            <span className="font-bold text-brand-gold-dark">{fmt(r.commission_total)}</span>
          )},
          { key:"referred_orders", label:"Orders", align:"right", hide:"sm", render: r => r.referred?.total_orders ?? 0 },
          { key:"created_at", label:"Date", hide:"sm", render: r => (
            <span className="text-xs text-brand-muted">{fmtDate(r.created_at)}</span>
          )},
        ]}
      />
    </div>
  );
}
