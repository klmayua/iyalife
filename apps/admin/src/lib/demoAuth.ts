// Must match apps/web/src/lib/demoPersonas.ts — this is a demo handoff
// token, not real auth. Neither app has a real backend yet.
export const DEMO_HANDOFF_TOKEN = "iyalife-demo-2026";

export const FOUNDER_CREDENTIALS = { email: "founder.demo@iyalife.co", password: "demo1234" };

const SESSION_KEY = "iyalife_admin_demo_session";

export function getDemoSession(): boolean {
  return localStorage.getItem(SESSION_KEY) === "founder";
}

export function setDemoSession() {
  localStorage.setItem(SESSION_KEY, "founder");
}

export function clearDemoSession() {
  localStorage.removeItem(SESSION_KEY);
}
