import { useState } from "react";
import { Card, CardHeader, CardTitle, CardBody } from "@iyalife/ui";
import { supabase, useQuery, fmt, fmtDate } from "../hooks/useSupabase";

function periodStart(period: string): string {
  const now = new Date();
  if (period === "last_month") {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  }
  if (period === "current_quarter") {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    return new Date(now.getFullYear(), quarterMonth, 1).toISOString();
  }
  if (period === "ytd") {
    return new Date(now.getFullYear(), 0, 1).toISOString();
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function periodEnd(period: string): string {
  const now = new Date();
  if (period === "last_month") {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
  return now.toISOString();
}

export default function Finance() {
  const [period, setPeriod] = useState("current_month");

  const { data: periodTransactions } = useQuery(async () =>
    supabase
      .from("transactions")
      .select("type, amount")
      .gte("created_at", periodStart(period))
      .lt("created_at", periodEnd(period)),
    [period],
  );

  const sumByType = (type: string) =>
    (periodTransactions ?? [])
      .filter(t => t.type === type)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

  const grossRevenue      = sumByType("revenue");
  const commissionPayouts = sumByType("commission");
  const dataCost          = sumByType("data_reward");
  const refunds           = sumByType("refund");
  const payouts           = sumByType("payout");
  const netOperating      = grossRevenue - commissionPayouts - dataCost - refunds - payouts;

  const summary = periodTransactions ? {
    gross_revenue:      grossRevenue,
    commission_payouts: commissionPayouts,
    data_cost:           dataCost,
    net_operating:       netOperating,
  } : null;

  const { data: transactions } = useQuery(async () =>
    supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    [],
  );

  const txTypeColor: Record<string, string> = {
    revenue:     "text-green-700",
    commission:  "text-amber-700",
    data_reward: "text-blue-700",
    payout:      "text-red-600",
    refund:      "text-red-600",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-dark">Financial Ledger</h1>
          <p className="text-brand-muted text-sm mt-1">ICAN-standard records · Phase Zero</p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-brand border border-brand-border text-sm bg-white"
        >
          <option value="current_month">This month</option>
          <option value="last_month">Last month</option>
          <option value="current_quarter">This quarter</option>
          <option value="ytd">Year to date</option>
        </select>
      </div>

      {/* P&L summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Gross Revenue",       val: summary?.gross_revenue,      color:"text-green-700",  bg:"bg-green-50",   border:"border-green-200" },
          { label:"Commission Payouts",  val: summary?.commission_payouts, color:"text-amber-700", bg:"bg-amber-50",   border:"border-amber-200" },
          { label:"Data Reward Cost",    val: summary?.data_cost,          color:"text-blue-700",  bg:"bg-blue-50",    border:"border-blue-200" },
          { label:"Net Operating",       val: summary?.net_operating,      color:"text-brand-teal-dark", bg:"bg-brand-teal-light", border:"border-brand-teal/30" },
        ].map(s => (
          <div key={s.label}
            className={`rounded-brand border ${s.border} ${s.bg} p-4 flex flex-col gap-1`}>
            <p className={`text-xl font-bold ${s.color}`}>{fmt(s.val ?? 0)}</p>
            <p className="text-xs text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Capital allocation */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Capital Allocation — Bible 5.3</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              { label:"Reserve (Resilience)",    pct:"—", color:"text-brand-teal" },
              { label:"Reinvestment (Growth)",   pct:"—", color:"text-brand-gold-dark" },
              { label:"Mission Contribution",    pct:"—", color:"text-green-700" },
            ].map(a => (
              <div key={a.label} className="flex flex-col gap-1 p-3 rounded-md bg-brand-surface">
                <p className={`text-lg font-bold ${a.color}`}>{a.pct}</p>
                <p className="text-xs text-brand-muted leading-tight">{a.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-muted mt-3">
            Ratios set in Playbook P.15 and updated at each Quarterly Strategic Review.
          </p>
        </CardBody>
      </Card>

      {/* Transaction log */}
      <div>
        <h2 className="font-bold text-brand-teal-dark mb-4">Transaction Log</h2>
        <div className="rounded-brand border border-brand-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface border-b border-brand-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden sm:table-cell">Reference</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(transactions ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-brand-muted text-sm">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (transactions ?? []).map(tx => (
                <tr key={tx.id} className="border-b border-brand-border last:border-0 hover:bg-brand-surface">
                  <td className="px-4 py-3 text-xs text-brand-muted">{fmtDate(tx.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold uppercase ${txTypeColor[tx.type] ?? "text-brand-muted"}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-muted font-mono hidden sm:table-cell">
                    {tx.reference ?? "—"}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${
                    ["payout","commission","data_reward","refund"].includes(tx.type)
                      ? "text-red-600" : "text-green-700"
                  }`}>
                    {["payout","commission","data_reward","refund"].includes(tx.type) ? "−" : "+"}
                    {fmt(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
