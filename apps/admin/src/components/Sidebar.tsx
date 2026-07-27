import { NavLink } from "react-router-dom";
import { Logo, cn } from "@iyalife/ui";
import { clearDemoSession } from "../lib/demoAuth";

const navItems = [
  {
    section: "Overview",
    links: [
      { to: "/",         label: "Dashboard",       icon: "▦" },
    ],
  },
  {
    section: "Commerce",
    links: [
      { to: "/orders",   label: "Orders",           icon: "📦" },
      { to: "/products", label: "Products",         icon: "🛍" },
      { to: "/suppliers",label: "Suppliers",        icon: "🤝" },
    ],
  },
  {
    section: "Community",
    links: [
      { to: "/mothers",  label: "Mothers",          icon: "👩" },
      { to: "/referrals",label: "Referrals",        icon: "💛" },
      { to: "/tiers",    label: "Tier Management",  icon: "◆" },
    ],
  },
  {
    section: "Operations",
    links: [
      { to: "/finance",  label: "Financial Ledger", icon: "₦" },
      { to: "/decisions",label: "Decision Log",     icon: "📋" },
      { to: "/insights", label: "Mother Insights",  icon: "💡" },
      { to: "/projects", label: "Projects (PM)",    icon: "🗂" },
    ],
  },
  {
    section: "Institution",
    links: [
      { to: "/metrics",  label: "All Metrics",      icon: "📊" },
      { to: "/settings", label: "Settings",         icon: "⚙" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 h-screen sticky top-0 overflow-y-auto
      bg-brand-teal-dark text-white flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="inline-flex bg-white rounded-md px-3 py-2">
          <Logo size={55} />
        </div>
        <p className="text-xs text-white/40 mt-2 ml-1">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-5">
        {navItems.map(section => (
          <div key={section.section} className="flex flex-col gap-0.5">
            <span className="px-2 text-[10px] uppercase tracking-widest
              font-semibold text-white/30 mb-1">
              {section.section}
            </span>
            {section.links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm",
                    "transition-colors font-medium",
                    isActive
                      ? "bg-brand-gold text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  )
                }
              >
                <span className="text-base leading-none">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 flex flex-col gap-2">
        <p className="text-xs text-white/30">Phase Zero · v1.0</p>
        <p className="text-xs text-white/50 font-medium">IyaLife</p>
        <button
          onClick={() => { clearDemoSession(); window.location.reload(); }}
          className="text-xs text-white/50 hover:text-white text-left underline decoration-white/30
            hover:decoration-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
