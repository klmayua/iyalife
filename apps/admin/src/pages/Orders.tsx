import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { supabase, useQuery, fmt, fmtDate } from "../hooks/useSupabase";

export default function Orders() {
  const [status, setStatus] = useState("");

  const { data: orders, loading, refetch } = useQuery(async () => {
    let q = supabase
      .from("orders")
      .select("*, mother:mother_id(full_name, phone)")
      .order("created_at", { ascending: false });
    if (status) q = q.eq("status", status);
    return q;
  }, [status]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-dark">Orders</h1>
          <p className="text-brand-muted text-sm mt-1">
            {orders?.length ?? 0} orders total
          </p>
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 rounded-brand border border-brand-border text-sm
            text-brand-ink bg-white focus:outline-none focus:border-brand-teal"
        >
          <option value="">All statuses</option>
          {["pending","confirmed","delivered","cancelled"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
      </div>

      <DataTable
        loading={loading}
        empty="No orders found."
        data={orders ?? []}
        columns={[
          { key:"id", label:"Order", render: r => <span className="font-mono text-xs text-brand-muted">#{r.id.slice(0,8).toUpperCase()}</span> },
          { key:"mother", label:"Mother", render: r => <span className="font-medium">{r.mother?.full_name ?? "—"}</span> },
          { key:"total_amount", label:"Amount", align:"right", render: r => <span className="font-bold text-brand-teal">{fmt(r.total_amount)}</span> },
          { key:"status", label:"Status", render: r => (
            <select
              value={r.status}
              onChange={e => { e.stopPropagation(); updateStatus(r.id, e.target.value); }}
              onClick={e => e.stopPropagation()}
              className="text-xs px-2 py-1 rounded-md border border-brand-border bg-white"
            >
              {["pending","confirmed","delivered","cancelled"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )},
          { key:"created_at", label:"Date", hide:"sm", render: r => <span className="text-brand-muted text-xs">{fmtDate(r.created_at)}</span> },
        ]}
      />
    </div>
  );
}
