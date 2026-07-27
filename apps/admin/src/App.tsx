import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./pages/Login";
import { DEMO_HANDOFF_TOKEN, getDemoSession, setDemoSession } from "./lib/demoAuth";
import Dashboard   from "./pages/Dashboard";
import Orders      from "./pages/Orders";
import Mothers     from "./pages/Mothers";
import Referrals   from "./pages/Referrals";
import Finance     from "./pages/Finance";
import Decisions   from "./pages/Decisions";
import Insights    from "./pages/Insights";
import Metrics     from "./pages/Metrics";
import { Products, Settings } from "./pages/ProductsSettings";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 rounded-brand
      border-2 border-dashed border-brand-border">
      <div className="text-center">
        <p className="text-brand-muted font-medium">{title}</p>
        <p className="text-xs text-brand-muted/60 mt-1">Coming in next iteration</p>
      </div>
    </div>
  );
}

export function App() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "founder" && params.get("token") === DEMO_HANDOFF_TOKEN) {
      setDemoSession();
      window.history.replaceState({}, "", window.location.pathname);
    }
    setAuthed(getDemoSession());
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-brand-surface font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-7">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/orders"     element={<Orders />} />
              <Route path="/products"   element={<Products />} />
              <Route path="/suppliers"  element={<Placeholder title="Suppliers" />} />
              <Route path="/mothers"    element={<Mothers />} />
              <Route path="/referrals"  element={<Referrals />} />
              <Route path="/tiers"      element={<Placeholder title="Tier Management" />} />
              <Route path="/finance"    element={<Finance />} />
              <Route path="/decisions"  element={<Decisions />} />
              <Route path="/insights"   element={<Insights />} />
              <Route path="/projects"   element={<Placeholder title="Projects (PRINCE2)" />} />
              <Route path="/metrics"    element={<Metrics />} />
              <Route path="/settings"   element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
