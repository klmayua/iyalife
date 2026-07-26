import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL  as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

export { supabase };

export function useQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  deps: any[] = [],
) {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    const { data: d, error: e } = await queryFn();
    setData(d);
    setError(e?.message ?? null);
    setLoading(false);
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run };
}

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", minimumFractionDigits: 0,
  }).format(n ?? 0);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
