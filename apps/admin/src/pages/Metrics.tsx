import { MetricCard } from "@iyalife/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMetrics, useGrowthTrend } from "../hooks/useMetrics";
import { fmt } from "../hooks/useSupabase";

const dash = (v: number | null) => (v === null ? "—" : String(v));

export default function Metrics() {
  const { data: summary, loading } = useMetrics();
  const { data: trend } = useGrowthTrend(30);

  const commercial = [
    { label:"Repeat Purchase Rate",     value: dash(summary?.repeatPurchaseRate ?? null),    unit:"%",  type:"commercial" as const },
    { label:"Gross Margin per Order",   value: summary?.grossMarginPerOrder != null ? fmt(summary.grossMarginPerOrder) : "—", unit:"", type:"commercial" as const },
    { label:"Referral Activation Rate", value: dash(summary?.referralActivationRate ?? null), unit:"%", type:"commercial" as const },
    { label:"Referral Conversion Rate", value: dash(summary?.referralConversionRate ?? null), unit:"%", type:"commercial" as const },
  ];

  const mission = [
    { label:"Mother Onboarding Rate",   value: dash(summary?.motherOnboardingRate ?? null),   unit:"/mo",    type:"mission" as const },
    { label:"Satisfaction Index",        value: dash(summary?.satisfactionIndex ?? null),      unit:"/5",     type:"mission" as const },
    { label:"Success Stories",           value: dash(summary?.successStoriesCaptured ?? null), unit:"this Q", type:"mission" as const },
    { label:"Value Exchanges",           value: dash(summary?.valueExchangesRecorded ?? null), unit:"/mo",    type:"mission" as const },
    { label:"Community Engagement",      value: dash(summary?.communityEngagementRate ?? null),unit:"%",      type:"mission" as const },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-dark">All Metrics</h1>
          <p className="text-brand-muted text-sm mt-1">
            Nine metrics. Commercial and mission health — both required, neither optional.
          </p>
        </div>
        {summary && (
          <p className="text-xs text-brand-muted whitespace-nowrap">
            Last updated {summary.lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {/* Commercial health */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-brand-teal-dark text-sm uppercase tracking-wide">
            Commercial Health
          </h2>
          <div className="flex-1 h-px bg-brand-border" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-brand bg-brand-surface animate-pulse" />)
            : commercial.map(m => <MetricCard key={m.label} {...m} />)}
        </div>
      </section>

      {/* Mission health */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-brand-gold-dark text-sm uppercase tracking-wide">
            Mission Health
          </h2>
          <div className="flex-1 h-px bg-brand-border" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? [...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-brand bg-brand-surface animate-pulse" />)
            : mission.map(m => <MetricCard key={m.label} {...m} />)}
        </div>
      </section>

      {/* Trend chart */}
      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-brand-teal-dark text-sm uppercase tracking-wide">
          Community Growth Trend — 30 Days
        </h2>
        <div className="rounded-brand border border-brand-border bg-white p-5">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8C893" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5B6B6E" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5B6B6E" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #D8C893", fontSize: "12px" }}
              />
              <Line type="monotone" dataKey="total_members" stroke="#0B555C" strokeWidth={2} dot={false} name="Founding Members" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Guiding principle reminder */}
      <div className="rounded-brand bg-brand-gold-light border border-brand-gold/30 p-5">
        <p className="text-brand-gold-dark font-semibold italic text-sm leading-relaxed">
          "Does this make motherhood more secure, more supported, more prosperous?"
        </p>
        <p className="text-brand-muted text-xs mt-2">
          Apply this filter to every metric interpretation. A commercially strong IyaLife
          that mothers do not trust has failed. — Bible 2.10
        </p>
      </div>
    </div>
  );
}
