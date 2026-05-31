import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} />

      <div style={{ marginLeft: sidebarWidth, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.25s ease" }}>
        {/* Topbar */}
        <div style={{
          height: 60, background: "var(--bg2)", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 12,
          position: "sticky", top: 0, zIndex: 50, flexShrink: 0
        }}>
          {/* Toggle sidebar */}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: 34, height: 34, borderRadius: 8, background: "var(--bg3)",
            border: "1px solid var(--border)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text2)", transition: "all 0.15s", flexShrink: 0
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Search */}
          <input
            placeholder="⌘K Rechercher un prospect..."
            style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "8px 14px", color: "var(--text)",
              fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none",
              width: 260, transition: "all 0.2s"
            }}
            onFocus={e => { e.target.style.width = "320px"; e.target.style.borderColor = "var(--accent)"; }}
            onBlur={e => { e.target.style.width = "260px"; e.target.style.borderColor = "var(--border)"; }}
          />

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {/* Readonly badge */}
            {user?.role === "DIRECTEUR" && (
              <span style={{ background: "rgba(245,158,11,.12)", color: "var(--amber)", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                👁️ Lecture seule
              </span>
            )}

            {/* Theme toggle */}
            <button onClick={() => {
              const dark = document.documentElement.getAttribute("data-theme") === "dark";
              document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
            }} style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              🌙
            </button>

            {/* New lead button */}
            {!["DIRECTEUR","COMPTABILITE"].includes(user?.role) && (
              <button onClick={() => navigate("/leads?new=1")} style={{
                padding: "8px 16px", borderRadius: 8, background: "var(--accent)",
                border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6
              }}>
                + Nouveau lead
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
