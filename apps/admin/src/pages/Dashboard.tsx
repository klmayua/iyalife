import { MetricCard, Card, CardHeader, CardTitle, CardBody, Badge } from "@iyalife/ui";
import { useMetrics } from "../hooks/useMetrics";
import { fmt } from "../hooks/useSupabase";

const dash = (v: number | null | undefined) => (v === null || v === undefined ? "—" : String(v));

const recentActivity = [
  { label: "Platform scaffold initiated",  time: "Jul 1, 2026", type: "system"    },
  { label: "Decision Log opened",          time: "Jul 1, 2026", type: "ops"       },
  { label: "Phase Zero formally initiated",time: "Jul 1, 2026", type: "milestone" },
];

export default function Dashboard() {
  const { data: summary, loading } = useMetrics();

  const commercial = [
    { label: "Repeat Purchase Rate",     value: dash(summary?.repeatPurchaseRate),     unit: "%", type: "commercial" as const },
    { label: "Gross Margin per Order",   value: summary?.grossMarginPerOrder != null ? fmt(summary.grossMarginPerOrder) : "—", unit: "", type: "commercial" as const },
    { label: "Referral Activation Rate", value: dash(summary?.referralActivationRate), unit: "%", type: "commercial" as const },
    { label: "Referral Conversion Rate", value: dash(summary?.referralConversionRate), unit: "%", type: "commercial" as const },
  ];

  const mission = [
    { label: "Mother Onboarding Rate", value: dash(summary?.motherOnboardingRate),    unit: "/ mo",   type: "mission" as const },
    { label: "Satisfaction Index",     value: dash(summary?.satisfactionIndex),       unit: "/ 5",    type: "mission" as const },
    { label: "Success Stories",        value: dash(summary?.successStoriesCaptured),  unit: "this Q", type: "mission" as const },
    { label: "Value Exchanges",        value: dash(summary?.valueExchangesRecorded),  unit: "/ mo",   type: "mission" as const },
    { label: "Community Engagement",   value: dash(summary?.communityEngagementRate), unit: "%",      type: "mission" as const },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-dark">Dashboard</h1>
          <p className="text-brand-muted text-sm mt-1">
            Phase Zero · {new Date().toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="teal">Phase Zero Active</Badge>
          {summary && (
            <span className="text-xs text-brand-muted">
              Last updated {summary.lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* Commercial metrics */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
          Commercial Health
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-brand bg-brand-surface animate-pulse" />)
            : commercial.map(m => <MetricCard key={m.label} {...m} />)}
        </div>
      </section>

      {/* Mission metrics */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
          Mission Health
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? [...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-brand bg-brand-surface animate-pulse" />)
            : mission.map(m => <MetricCard key={m.label} {...m} />)}
        </div>
      </section>

      {/* Recent activity + guiding principle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="flex flex-col divide-y divide-brand-border">
              {recentActivity.map(item => (
                <li key={item.label}
                  className="flex items-start justify-between gap-3 py-3">
                  <span className="text-sm text-brand-ink">{item.label}</span>
                  <span className="text-xs text-brand-muted whitespace-nowrap">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card variant="gold" className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="!text-brand-gold-dark">
              The Guiding Principle
            </CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-brand-gold-dark text-base font-medium leading-relaxed italic">
              "Does this make motherhood more secure, more supported,
              more prosperous?"
            </p>
            <p className="text-brand-muted text-xs mt-3">
              Apply this filter to every decision. — Bible 2.10
            </p>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
