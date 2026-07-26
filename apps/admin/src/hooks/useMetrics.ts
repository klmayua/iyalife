import { useCallback, useEffect, useState } from "react";
import { supabase } from "./useSupabase";

export interface MetricsSummary {
  // Commercial
  repeatPurchaseRate: number | null;      // % of mothers with >1 order in last 60 days
  grossMarginPerOrder: number | null;     // ₦ — avg order value * 15% Phase Zero margin
  referralActivationRate: number | null;  // % of mothers who referred someone within 30d of joining
  referralConversionRate: number | null;  // % of referred mothers who placed >=1 order

  // Mission
  motherOnboardingRate: number | null;    // new mothers this calendar month
  satisfactionIndex: number | null;       // avg satisfaction_scores.score (1-5), null if no scores yet
  successStoriesCaptured: number | null;  // success_stories this calendar quarter
  valueExchangesRecorded: number | null;  // orders + referrals + success stories this month
  communityEngagementRate: number | null; // % of mothers with last_seen in the last 7 days

  lastUpdated: Date;
}

function pct(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function startOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function startOfQuarter(): string {
  const d = new Date();
  const qMonth = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), qMonth, 1).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function computeMetrics(): Promise<MetricsSummary> {
  const [
    ordersLast60,
    allOrders,
    mothersForActivation,
    allReferrals,
    referralConversionOrders,
    onboardingCount,
    satisfactionScores,
    successStoriesCount,
    ordersThisMonthCount,
    referralsThisMonthCount,
    successStoriesThisMonthCount,
    activeMothersCount,
    totalMothersCount,
  ] = await Promise.all([
    supabase.from("orders").select("mother_id").gte("created_at", daysAgo(60)),
    supabase.from("orders").select("total_amount"),
    supabase.from("mothers").select("id, created_at").lte("created_at", daysAgo(30)),
    supabase.from("referrals").select("referrer_id, referred_id, created_at"),
    supabase.from("orders").select("mother_id"),
    supabase.from("mothers").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth()),
    supabase.from("satisfaction_scores").select("score"),
    supabase.from("success_stories").select("id", { count: "exact", head: true }).gte("created_at", startOfQuarter()),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth()),
    supabase.from("referrals").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth()),
    supabase.from("success_stories").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth()),
    supabase.from("mothers").select("id", { count: "exact", head: true }).gte("last_seen", daysAgo(7)),
    supabase.from("mothers").select("id", { count: "exact", head: true }),
  ]);

  // Repeat purchase rate — among mothers who ordered in the last 60 days,
  // what share ordered more than once.
  const orderCountsByMother = new Map<string, number>();
  for (const row of ordersLast60.data ?? []) {
    orderCountsByMother.set(row.mother_id, (orderCountsByMother.get(row.mother_id) ?? 0) + 1);
  }
  const purchasingMothers = orderCountsByMother.size;
  const repeatMothers = [...orderCountsByMother.values()].filter((n) => n > 1).length;
  const repeatPurchaseRate = pct(repeatMothers, purchasingMothers);

  // Gross margin per order
  const orderTotals = (allOrders.data ?? []).map((o) => o.total_amount ?? 0);
  const avgOrderValue = orderTotals.length
    ? orderTotals.reduce((s, v) => s + v, 0) / orderTotals.length
    : 0;
  const grossMarginPerOrder = orderTotals.length ? Math.round(avgOrderValue * 0.15) : null;

  // Referral activation rate — referred someone within 30 days of their own signup
  const referralsByReferrer = new Map<string, string[]>();
  for (const r of allReferrals.data ?? []) {
    const list = referralsByReferrer.get(r.referrer_id) ?? [];
    list.push(r.created_at);
    referralsByReferrer.set(r.referrer_id, list);
  }
  const eligibleMothers = mothersForActivation.data ?? [];
  const activatedCount = eligibleMothers.filter((m) => {
    const referralDates = referralsByReferrer.get(m.id);
    if (!referralDates) return false;
    const cutoff = new Date(m.created_at).getTime() + 30 * 24 * 60 * 60 * 1000;
    return referralDates.some((d) => new Date(d).getTime() <= cutoff);
  }).length;
  const referralActivationRate = pct(activatedCount, eligibleMothers.length);

  // Referral conversion rate — referred mothers who went on to order
  const referredIds = new Set((allReferrals.data ?? []).map((r) => r.referred_id));
  const orderingMotherIds = new Set((referralConversionOrders.data ?? []).map((o) => o.mother_id));
  const convertedCount = [...referredIds].filter((id) => orderingMotherIds.has(id)).length;
  const referralConversionRate = pct(convertedCount, referredIds.size);

  // Satisfaction index
  const scores = (satisfactionScores.data ?? []).map((s) => s.score);
  const satisfactionIndex = scores.length
    ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
    : null;

  return {
    repeatPurchaseRate,
    grossMarginPerOrder,
    referralActivationRate,
    referralConversionRate,

    motherOnboardingRate: onboardingCount.count ?? 0,
    satisfactionIndex,
    successStoriesCaptured: successStoriesCount.count ?? 0,
    valueExchangesRecorded:
      (ordersThisMonthCount.count ?? 0) +
      (referralsThisMonthCount.count ?? 0) +
      (successStoriesThisMonthCount.count ?? 0),
    communityEngagementRate: pct(activeMothersCount.count ?? 0, totalMothersCount.count ?? 0),

    lastUpdated: new Date(),
  };
}

export interface GrowthPoint {
  date: string;
  total_members: number;
}

export function useGrowthTrend(days = 30) {
  const [data, setData] = useState<GrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: mothers } = await supabase
        .from("mothers")
        .select("created_at")
        .order("created_at", { ascending: true });

      const signupDates = (mothers ?? []).map((m) => new Date(m.created_at));
      const points: GrowthPoint[] = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        day.setHours(23, 59, 59, 999);
        points.push({
          date: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          total_members: signupDates.filter((d) => d <= day).length,
        });
      }

      setData(points);
      setLoading(false);
    })();
  }, [days]);

  return { data, loading };
}

export function useMetrics() {
  const [data, setData] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await computeMetrics();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
