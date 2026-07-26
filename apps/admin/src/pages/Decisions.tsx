import { useState } from "react";
import { Badge } from "@iyalife/ui";
import { supabase, useQuery, fmtDate } from "../hooks/useSupabase";

const doctrineRef: Record<string, string> = {
  "commercial": "Bible 5.4",
  "governance": "Bible 0.6",
  "technology": "Bible 6.x",
  "mission":    "Bible 2.10",
  "community":  "Bible 4.3",
  "brand":      "Bible 7.x",
  "operations": "Bible 8.x",
  "capital":    "Bible 5.3",
};

export default function Decisions() {
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", decision: "", rationale: "", doctrine: "", category: "commercial", expected_outcome: "",
  });

  const { data: decisions, loading, refetch } = useQuery(async () => {
    let q = supabase.from("decision_log").select("*").order("created_at", { ascending: false });
    if (category) q = q.eq("category", category);
    return q;
  }, [category]);

  const submit = async () => {
    if (!form.title || !form.decision) return alert("Title and decision are required.");
    await supabase.from("decision_log").insert({
      ...form,
      created_by: "founder",
      bible_reference: doctrineRef[form.category] ?? "—",
    });
    setForm({ title:"", decision:"", rationale:"", doctrine:"", category:"commercial", expected_outcome:"" });
    setShowForm(false);
    refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-dark">Decision Log</h1>
          <p className="text-brand-muted text-sm mt-1">Institutional memory. Every significant decision recorded.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-brand bg-brand-teal text-white text-sm
            font-semibold hover:bg-brand-teal-dark transition-colors">
          + Record Decision
        </button>
      </div>

      {/* New decision form */}
      {showForm && (
        <div className="rounded-brand border border-brand-border bg-white p-5 flex flex-col gap-4">
          <h2 className="font-bold text-brand-teal-dark">New Decision</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-muted mb-1">Decision title</label>
              <input value={form.title} onChange={e => setForm({...form, title:e.target.value})}
                placeholder="What was decided?"
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-teal">
                {Object.keys(doctrineRef).map(k => (
                  <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">
                Bible reference — {doctrineRef[form.category]}
              </label>
              <input value={form.doctrine} onChange={e => setForm({...form, doctrine:e.target.value})}
                placeholder="Which doctrine does this rest on?"
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-muted mb-1">The decision</label>
              <textarea value={form.decision} onChange={e => setForm({...form, decision:e.target.value})}
                rows={2} placeholder="State the decision made..."
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm resize-none focus:outline-none focus:border-brand-teal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-muted mb-1">Rationale</label>
              <textarea value={form.rationale} onChange={e => setForm({...form, rationale:e.target.value})}
                rows={2} placeholder="Why was this decision made? What alternatives were considered?"
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm resize-none focus:outline-none focus:border-brand-teal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-muted mb-1">Expected outcome</label>
              <input value={form.expected_outcome} onChange={e => setForm({...form, expected_outcome:e.target.value})}
                placeholder="What should this decision produce?"
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={submit}
              className="px-5 py-2.5 rounded-brand bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark transition-colors">
              Record Decision
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-brand border border-brand-border text-brand-muted text-sm hover:text-brand-ink transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto">
        {["", ...Object.keys(doctrineRef)].map(c => (
          <button key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${category === c
                ? "bg-brand-teal text-white border-brand-teal"
                : "bg-white text-brand-muted border-brand-border hover:border-brand-teal"
              }`}>
            {c ? c.charAt(0).toUpperCase()+c.slice(1) : "All"}
          </button>
        ))}
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_,i) => <div key={i} className="h-24 rounded-brand bg-brand-surface animate-pulse" />)}
        </div>
      ) : (decisions ?? []).length === 0 ? (
        <div className="rounded-brand border border-dashed border-brand-border py-16 text-center text-brand-muted text-sm">
          No decisions recorded yet. Record your first decision to start the institutional log.
        </div>
      ) : (decisions ?? []).map(d => (
        <div key={d.id}
          className="rounded-brand border border-brand-border bg-white p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-brand-teal-dark">{d.title}</p>
              <p className="text-xs text-brand-muted mt-0.5">
                {fmtDate(d.created_at)} · {d.created_by} · {d.bible_reference}
              </p>
            </div>
            <Badge variant={d.category === "mission" ? "gold" : "teal"}>
              {d.category}
            </Badge>
          </div>
          <p className="text-sm text-brand-ink leading-relaxed">{d.decision}</p>
          {d.rationale && (
            <p className="text-sm text-brand-muted leading-relaxed border-t border-brand-border pt-3">
              <span className="font-medium text-brand-ink">Rationale: </span>{d.rationale}
            </p>
          )}
          {d.expected_outcome && (
            <p className="text-xs text-brand-muted">
              <span className="font-medium">Expected: </span>{d.expected_outcome}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
