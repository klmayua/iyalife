import { useState } from "react";
import { Logo } from "@iyalife/ui";
import { FOUNDER_CREDENTIALS, setDemoSession } from "../lib/demoAuth";

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fillDemo = () => {
    setEmail(FOUNDER_CREDENTIALS.email);
    setPassword(FOUNDER_CREDENTIALS.password);
    setError("");
  };

  const handleSignIn = () => {
    if (
      email.trim().toLowerCase() === FOUNDER_CREDENTIALS.email &&
      password === FOUNDER_CREDENTIALS.password
    ) {
      setDemoSession();
      onSuccess();
    } else {
      setError("Invalid credentials. Click the Founder card below to preload the demo login.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-surface px-4">
      <Logo size={80} className="mb-8" />
      <div className="w-full max-w-sm rounded-brand bg-white border border-brand-border p-6 flex flex-col gap-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-brand-teal-dark">Founder Access</h1>
          <p className="text-sm text-brand-muted mt-1">Sign in to the admin console.</p>
        </div>

        <button
          type="button"
          onClick={fillDemo}
          className="flex flex-col gap-1.5 p-3 rounded-brand border-2 border-brand-border
            hover:border-brand-teal transition-colors text-left"
        >
          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold
            border bg-brand-teal-light text-brand-teal border-brand-teal/40">
            ◆ Founder / Admin
          </span>
          <span className="text-sm font-semibold text-brand-ink">Founder Admin</span>
          <span className="text-[11px] text-brand-muted">Operates the admin dashboard</span>
        </button>

        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1.5">Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-brand border border-brand-border text-sm
              focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-brand border border-brand-border text-sm
              focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleSignIn}
          className="w-full py-3 rounded-brand bg-brand-teal text-white font-semibold text-sm
            hover:bg-brand-teal-dark transition-colors"
        >
          Sign In
        </button>

        <a href="https://iyalife.vercel.app" className="text-xs text-brand-muted hover:text-brand-teal text-center">
          ← Back to marketing site
        </a>
      </div>
    </div>
  );
}
