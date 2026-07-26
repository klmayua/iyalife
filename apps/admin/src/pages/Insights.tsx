import { useState } from "react";
import { Badge } from "@iyalife/ui";
import { supabase, useQuery, fmtDate } from "../hooks/useSupabase";

const categories = ["product_feedback","community_signal","health_concern","financial_signal","referral_pattern","success_story","churn_signal"];

export default function Insights() {
  const [cat, setCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category:"product_feedback", signal:"", implication:"", source:"community_observation" });

  const { data: insights, loading, refetch } = useQuery(async () => {
    let q = supabase.from("mother_insights").select("*").order("created_at", { ascending: false });
    if (cat) q = q.eq("category", cat);
    return q;
  }, [cat]);

  const { data: stories } = useQuery(async () =>
    supabase.from("success_stories").select("*").order("created_at", { ascending: false }).limit(5),
    [],
  );

  const submit = async () => {
    if (!form.signal) return alert("Signal is required.");
    await supabase.from("mother_insights").insert(form);
    setForm({ category:"product_feedback", signal:"", implication:"", source:"community_observation" });
    setShowForm(false);
    refetch();
  };

  const catColors: Record<string, any> = {
    product_feedback:  "default",
    community_signal:  "teal",
    success_story:     "gold",
    churn_signal:      "danger",
    health_concern:    "warning",
    financial_signal:  "teal",
    referral_pattern:  "gold",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-dark">Mother Insights</h1>
          <p className="text-brand-muted text-sm mt-1">What IyaLife is learning about its community.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-brand bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark transition-colors">
          + Record Insight
        </button>
      </div>

      {/* Success stories sidebar */}
      {(stories ?? []).length > 0 && (
        <div className="rounded-brand border border-brand-gold/30 bg-brand-gold-light p-5 flex flex-col gap-3">
          <h2 className="font-bold text-brand-gold-dark text-sm">Recent Success Stories</h2>
          {(stories ?? []).map(s => (
            <div key={s.id} className="bg-white rounded-md p-3 border border-brand-gold/20">
              <p className="text-sm text-brand-ink font-medium">{s.description}</p>
              <p className="text-xs text-brand-muted mt-1">{fmtDate(s.created_at)} · {s.category}</p>
            </div>
          ))}
        </div>
      )}

      {/* New insight form */}
      {showForm && (
        <div className="rounded-brand border border-brand-border bg-white p-5 flex flex-col gap-4">
          <h2 className="font-bold text-brand-teal-dark">Record Insight</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-teal">
                {categories.map(c => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Source</label>
              <select value={form.source} onChange={e => setForm({...form, source:e.target.value})}
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-teal">
                {["community_observation","direct_feedback","order_data","referral_data","support_interaction"].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g," ")}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-muted mb-1">Signal observed</label>
              <textarea value={form.signal} onChange={e => setForm({...form, signal:e.target.value})}
                rows={2} placeholder="What did you observe or learn?"
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm resize-none focus:outline-none focus:border-brand-teal" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-brand-muted mb-1">Implication</label>
              <input value={form.implication} onChange={e => setForm({...form, implication:e.target.value})}
                placeholder="What does this mean for IyaLife?"
                className="w-full px-3 py-2.5 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={submit}
              className="px-5 py-2.5 rounded-brand bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark transition-colors">
              Save Insight
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-brand border border-brand-border text-brand-muted text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto">
        {["", ...categories].map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${cat === c ? "bg-brand-teal text-white border-brand-teal" : "bg-white text-brand-muted border-brand-border hover:border-brand-teal"}`}>
            {c ? c.replace(/_/g," ") : "All"}
          </button>
        ))}
      </div>

      {/* Insight entries */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-20 rounded-brand bg-brand-surface animate-pulse" />)}</div>
      ) : (insights ?? []).length === 0 ? (
        <div className="rounded-brand border border-dashed border-brand-border py-16 text-center text-brand-muted text-sm">
          No insights recorded yet. Start capturing what you learn from the community.
        </div>
      ) : (insights ?? []).map(i => (
        <div key={i.id} className="rounded-brand border border-brand-border bg-white p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={catColors[i.category] ?? "default"}>{i.category?.replace(/_/g," ")}</Badge>
            <span className="text-xs text-brand-muted">{fmtDate(i.created_at)} · {i.source?.replace(/_/g," ")}</span>
          </div>
          <p className="text-sm text-brand-ink leading-relaxed">{i.signal}</p>
          {i.implication && (
            <p className="text-xs text-brand-muted border-t border-brand-border pt-2">
              <span className="font-medium text-brand-ink">Implication: </span>{i.implication}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
