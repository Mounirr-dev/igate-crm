import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_BY_ROLE = {
  PLATFORM_OWNER: [
    { to: "/companies", icon: "🏢", label: "Entreprises" },
    { to: "/billing", icon: "💳", label: "Facturation" },
    { to: "/permissions", icon: "🔐", label: "Permissions" },
    { to: "/", icon: "📊", label: "Dashboard" },
    { to: "/stats", icon: "📈", label: "Statistiques" },
    { to: "/settings", icon: "⚙️", label: "Paramètres" },
  ],
  COMPANY_ADMIN: [
    { to: "/", icon: "📊", label: "Dashboard" },
    { to: "/leads", icon: "👥", label: "Prospects" },
    { to: "/kanban", icon: "📋", label: "Pipeline" },
    { to: "/stats", icon: "📈", label: "Statistiques" },
    { to: "/integrations", icon: "🔌", label: "Intégrations" },
    { to: "/automations", icon: "⚡", label: "Automatisations" },
    { to: "/users", icon: "👤", label: "Utilisateurs" },
    { to: "/settings", icon: "⚙️", label: "Paramètres" },
  ],
  DIRECTEUR: [
    { to: "/", icon: "📊", label: "Dashboard" },
    { to: "/stats", icon: "📈", label: "Statistiques" },
    { to: "/leads", icon: "👥", label: "Prospects" },
  ],
  COMMERCIAL: [
    { to: "/", icon: "📊", label: "Mon Dashboard" },
    { to: "/leads", icon: "👥", label: "Mes Leads" },
    { to: "/kanban", icon: "📋", label: "Mon Pipeline" },
    { to: "/finance", icon: "💰", label: "Paiements" },
  ],
  COMPTABILITE: [
    { to: "/finance", icon: "💰", label: "Finance" },
    { to: "/", icon: "📊", label: "Dashboard" },
  ],
};

const ROLE_COLORS = {
  PLATFORM_OWNER: "linear-gradient(135deg,#3b82f6,#7c3aed)",
  COMPANY_ADMIN: "linear-gradient(135deg,#3b82f6,#06b6d4)",
  DIRECTEUR: "linear-gradient(135deg,#f59e0b,#ec4899)",
  COMMERCIAL: "linear-gradient(135deg,#10b981,#3b82f6)",
  COMPTABILITE: "linear-gradient(135deg,#ef4444,#f97316)",
};

const ROLE_LABEL = {
  PLATFORM_OWNER: "Platform Owner",
  COMPANY_ADMIN: "Company Admin",
  DIRECTEUR: "Directeur",
  COMMERCIAL: "Commercial",
  COMPTABILITE: "Comptabilité",
};

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_BY_ROLE[user?.role] || [];
  const initials = user?.nom?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={{
      width: collapsed ? 68 : 240,
      background: "var(--bg2)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, height: "100vh",
      zIndex: 100, transition: "width 0.25s ease", overflow: "hidden"
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0 }}>N</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800, whiteSpace: "nowrap" }}>NexCRM</div>
            <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".5px", textTransform: "uppercase" }}>SaaS v1.0</div>
          </div>
        )}
      </div>

      {/* Company badge */}
      {!collapsed && user?.company && (
        <div style={{ padding: "8px 16px", background: "rgba(59,130,246,.05)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, truncate: true }}>{user.company.nom}</div>
          <div style={{ fontSize: 10, color: "var(--text3)" }}>Plan {user.company.plan}</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 11,
              padding: collapsed ? "10px 0" : "9px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 10, cursor: "pointer",
              transition: "all 0.15s", textDecoration: "none",
              color: isActive ? "var(--accent)" : "var(--text2)",
              background: isActive ? "rgba(59,130,246,.1)" : "transparent",
              fontWeight: isActive ? 600 : 500, fontSize: 13,
              marginBottom: 2, position: "relative",
              borderLeft: isActive && !collapsed ? "3px solid var(--accent)" : "3px solid transparent",
            })}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, background: "var(--bg3)", cursor: "pointer" }}
          onClick={handleLogout} title="Déconnexion">
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: ROLE_COLORS[user?.role] || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.nom}</div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>{ROLE_LABEL[user?.role]}</div>
            </div>
          )}
          {!collapsed && <span style={{ marginLeft: "auto", fontSize: 14, color: "var(--text3)" }}>🚪</span>}
        </div>
      </div>
    </aside>
  );
}
