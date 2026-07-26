import { useState } from "react";
import { Badge, TierBadge } from "@iyalife/ui";
import { DataTable } from "../components/DataTable";
import { supabase, useQuery, fmt, fmtDate } from "../hooks/useSupabase";

export default function Mothers() {
  const [tier,   setTier]   = useState("");
  const [search, setSearch] = useState("");

  const { data: mothers, loading } = useQuery(async () => {
    let q = supabase.from("mothers").select("*").order("created_at", { ascending: false });
    if (tier) q = q.eq("tier", tier);
    return q;
  }, [tier]);

  const filtered = (mothers ?? []).filter(m =>
    !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-teal-dark">Mothers</h1>
        <p className="text-brand-muted text-sm mt-1">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="flex-1 px-3.5 py-2.5 rounded-brand border border-brand-border
            text-sm text-brand-ink focus:outline-none focus:border-brand-teal"
        />
        <select
          value={tier}
          onChange={e => setTier(e.target.value)}
          className="px-3 py-2.5 rounded-brand border border-brand-border text-sm
            text-brand-ink bg-white focus:outline-none focus:border-brand-teal"
        >
          <option value="">All tiers</option>
          {["silver","gold","diamond"].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Total",    val: (mothers ?? []).length,                           color:"text-brand-teal" },
          { label:"Silver",   val: (mothers ?? []).filter(m=>m.tier==="silver").length, color:"text-gray-600" },
          { label:"Gold",     val: (mothers ?? []).filter(m=>m.tier==="gold").length,   color:"text-amber-600" },
          { label:"Diamond",  val: (mothers ?? []).filter(m=>m.tier==="diamond").length,color:"text-blue-600" },
        ].map(s => (
          <div key={s.label}
            className="rounded-brand border border-brand-border bg-white p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        loading={loading}
        empty="No mothers found."
        data={filtered}
        columns={[
          { key:"full_name", label:"Name", render: r => (
            <div>
              <p className="font-semibold text-brand-ink">{r.full_name}</p>
              <p className="text-xs text-brand-muted">{r.phone}</p>
            </div>
          )},
          { key:"member_number", label:"#", render: r => <span className="text-xs text-brand-muted">#{r.member_number ?? "—"}</span> },
          { key:"tier", label:"Tier", render: r => (
            <TierBadge tier={r.tier ?? "silver"} />
          )},
          { key:"total_orders", label:"Orders", align:"right", render: r => r.total_orders ?? 0 },
          { key:"total_earned", label:"Earned", align:"right", hide:"md", render: r => (
            <span className="text-brand-gold-dark font-medium">{fmt(r.total_earned)}</span>
          )},
          { key:"is_founding", label:"Founding", hide:"md", render: r => r.is_founding
            ? <Badge variant="gold">Founding</Badge>
            : <span className="text-brand-muted text-xs">—</span>
          },
          { key:"bvn_verified", label:"Verified", render: r => r.bvn_verified
            ? <Badge variant="success">✓</Badge>
            : <Badge variant="warning">Pending</Badge>
          },
          { key:"created_at", label:"Joined", hide:"sm", render: r => (
            <span className="text-xs text-brand-muted">{fmtDate(r.created_at)}</span>
          )},
        ]}
      />
    </div>
  );
}
