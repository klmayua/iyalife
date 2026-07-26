import { useState } from "react";
import { Badge } from "@iyalife/ui";
import { DataTable } from "../components/DataTable";
import { supabase, useQuery, fmt } from "../hooks/useSupabase";

interface Product {
  id?:               string;
  name:              string;
  slug:              string;
  category:          string;
  price:             number;
  original_price?:   number | null;
  description?:      string | null;
  image?:            string | null;
  in_stock:          boolean;
  is_founding_deal:  boolean;
}

const CATEGORIES = [
  { value: "baby-care",         label: "Baby & Infant Care" },
  { value: "maternal-health",   label: "Maternal Health" },
  { value: "household",         label: "Household Essentials" },
  { value: "child-development", label: "Child Development" },
];

const EMPTY_FORM: Product = {
  name: "", slug: "", category: "baby-care", price: 0, original_price: null,
  description: "", image: "", in_stock: true, is_founding_deal: false,
};

function slugify(name: string): string {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function Products() {
  const { data: products, loading, refetch } = useQuery(async () =>
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    [],
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState<Product>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleStock = async (id: string, current: boolean) => {
    await supabase.from("products").update({ in_stock: !current }).eq("id", id);
    refetch();
  };

  const catEmoji: Record<string, string> = {
    "baby-care": "👶", "maternal-health": "🌿", "household": "🏠", "child-development": "📚",
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setPanelOpen(true);
  };

  const openEdit = (product: Product) => {
    setForm(product);
    setSlugTouched(true);
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name:              form.name,
      slug:              form.slug || slugify(form.name),
      category:          form.category,
      price:             Number(form.price),
      original_price:    form.original_price ? Number(form.original_price) : null,
      description:       form.description || null,
      image:             form.image || null,
      in_stock:          form.in_stock,
      is_founding_deal:  form.is_founding_deal,
    };

    if (form.id) {
      await supabase.from("products").update(payload).eq("id", form.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setSaving(false);
    setPanelOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    await supabase.from("products").delete().eq("id", form.id);
    setPanelOpen(false);
    refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-dark">Products</h1>
          <p className="text-brand-muted text-sm mt-1">{(products ?? []).length} products</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-brand bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark transition-colors">
          + Add Product
        </button>
      </div>
      <DataTable
        loading={loading}
        empty="No products yet. Add your first product."
        data={products ?? []}
        onRow={openEdit}
        columns={[
          { key:"name", label:"Product", render: r => (
            <div className="flex items-center gap-3">
              <span className="text-xl">{catEmoji[r.category] ?? "📦"}</span>
              <div>
                <p className="font-medium text-brand-ink text-sm">{r.name}</p>
                <p className="text-xs text-brand-muted capitalize">{r.category?.replace(/-/g," ")}</p>
              </div>
            </div>
          )},
          { key:"price", label:"Price", align:"right", render: r => (
            <span className="font-bold text-brand-teal">{fmt(r.price)}</span>
          )},
          { key:"in_stock", label:"Stock", render: r => (
            <button onClick={(e) => { e.stopPropagation(); toggleStock(r.id!, r.in_stock); }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                r.in_stock
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  : "bg-red-50 text-red-600 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
              }`}>
              {r.in_stock ? "In stock" : "Out of stock"}
            </button>
          )},
          { key:"is_founding_deal", label:"Founding Deal", hide:"md", render: r =>
            r.is_founding_deal ? <Badge variant="gold">Deal</Badge> : <span className="text-brand-muted text-xs">—</span>
          },
        ]}
      />

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={closePanel} />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="font-bold text-brand-teal-dark text-lg">
                {form.id ? "Edit Product" : "Add Product"}
              </h2>
              <button type="button" onClick={closePanel}
                className="text-brand-muted hover:text-brand-teal text-sm">✕</button>
            </div>

            <div className="flex-1 flex flex-col gap-4 px-6 py-5">
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">Product name</label>
                <input required value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">Slug</label>
                <input required value={form.slug}
                  onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: e.target.value })); }}
                  className="w-full px-3 py-2 rounded-brand border border-brand-border text-sm font-mono focus:outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">Category</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-brand border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-teal">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5">Price (₦)</label>
                  <input required type="number" min="0" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5">Original price</label>
                  <input type="number" min="0" value={form.original_price ?? ""}
                    onChange={e => setForm(f => ({ ...f, original_price: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-2 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">Description</label>
                <textarea rows={3} value={form.description ?? ""}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">Image URL</label>
                <input value={form.image ?? ""}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  className="w-full px-3 py-2 rounded-brand border border-brand-border text-sm focus:outline-none focus:border-brand-teal" />
              </div>

              <label className="flex items-center justify-between py-1">
                <span className="text-sm text-brand-ink">In stock</span>
                <input type="checkbox" checked={form.in_stock}
                  onChange={e => setForm(f => ({ ...f, in_stock: e.target.checked }))}
                  className="w-4 h-4 accent-brand-teal" />
              </label>

              <label className="flex items-center justify-between py-1">
                <span className="text-sm text-brand-ink">Founding deal</span>
                <input type="checkbox" checked={form.is_founding_deal}
                  onChange={e => setForm(f => ({ ...f, is_founding_deal: e.target.checked }))}
                  className="w-4 h-4 accent-brand-gold" />
              </label>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-brand-border">
              {form.id && (
                <button type="button" onClick={handleDelete}
                  className="px-4 py-2 rounded-brand border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                  Delete
                </button>
              )}
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-brand bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-dark transition-colors disabled:opacity-60">
                {saving ? "Saving…" : form.id ? "Save changes" : "Add product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function Settings() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-teal-dark">Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Platform configuration and operational parameters.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { title:"Founding circle cap", value:"20 direct referrals per member", desc:"Maximum direct referrals per founding member. Change in environment config." },
          { title:"Monthly data bundle", value:"2GB per active member", desc:"Renewal condition: 1 order or 1 referral per 30 days. Delivered via Africa's Talking." },
          { title:"Payout cadence", value:"Weekly · Fridays", desc:"Minimum payout: ₦500. Requires BVN/NIN verification via Paystack." },
          { title:"Referral depth", value:"2 levels maximum", desc:"Level 1: direct referral commissions. Level 2: Gold+ tier only. No further depth." },
          { title:"Phase Zero status", value:"Active · Invitation only", desc:"Platform is closed to new members without a valid referral link." },
        ].map(s => (
          <div key={s.title} className="rounded-brand border border-brand-border bg-white p-5 flex items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-brand-teal-dark text-sm">{s.title}</p>
              <p className="text-xs text-brand-muted leading-relaxed">{s.desc}</p>
            </div>
            <span className="flex-shrink-0 text-sm font-medium text-brand-ink bg-brand-surface
              px-3 py-1.5 rounded-md border border-brand-border whitespace-nowrap">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
