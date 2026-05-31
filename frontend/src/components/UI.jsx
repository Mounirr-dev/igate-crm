import { useState, useEffect, useRef } from "react";

/* ═══ BUTTON ═══ */
const btnStyles = {
  base: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 18px", borderRadius: 10, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "Inter, sans-serif", transition: "all 0.2s",
    whiteSpace: "nowrap", textDecoration: "none",
  },
  primary: { background: "var(--accent)", color: "#fff", boxShadow: "0 2px 8px rgba(59,130,246,.25)" },
  secondary: { background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border)" },
  danger: { background: "rgba(239,68,68,.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,.2)" },
  ghost: { background: "transparent", color: "var(--text2)", border: "1px solid var(--border)" },
  success: { background: "rgba(16,185,129,.1)", color: "var(--green)", border: "1px solid rgba(16,185,129,.2)" },
};

export const Button = ({ children, variant = "primary", size = "md", onClick, disabled, style = {}, type = "button" }) => {
  const sizeStyle = size === "sm" ? { padding: "6px 12px", fontSize: 12 } : {};
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...btnStyles.base,
        ...btnStyles[variant],
        ...sizeStyle,
        ...style,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
};

/* ═══ BADGE ═══ */
const badgeColors = {
  blue: { background: "rgba(59,130,246,.12)", color: "#2563eb" },
  green: { background: "rgba(16,185,129,.12)", color: "#059669" },
  amber: { background: "rgba(245,158,11,.12)", color: "#d97706" },
  red: { background: "rgba(239,68,68,.12)", color: "#dc2626" },
  purple: { background: "rgba(124,58,237,.12)", color: "#7c3aed" },
  pink: { background: "rgba(236,72,153,.12)", color: "#db2777" },
  cyan: { background: "rgba(6,182,212,.12)", color: "#0891b2" },
  orange: { background: "rgba(249,115,22,.12)", color: "#ea580c" },
  gray: { background: "rgba(148,163,184,.12)", color: "var(--text2)" },
};

export const Badge = ({ children, color = "gray", style = {} }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    ...badgeColors[color], ...style
  }}>
    {children}
  </span>
);

export const STATUT_BADGE = {
  NOUVEAU: "blue", A_APPELER: "purple", CONTACTE: "amber",
  INTERESSE: "pink", RDV: "pink", PAIEMENT: "cyan",
  INSCRIT: "green", PERDU: "red"
};

export const STATUT_LABEL = {
  NOUVEAU: "Nouveau", A_APPELER: "À appeler", CONTACTE: "Contacté",
  INTERESSE: "Intéressé", RDV: "RDV", PAIEMENT: "Paiement",
  INSCRIT: "Inscrit", PERDU: "Perdu"
};

export const SOURCE_LABEL = {
  FACEBOOK: "Facebook", INSTAGRAM: "Instagram", TIKTOK: "TikTok",
  SITE_WEB: "Site web", WHATSAPP: "WhatsApp", QR_CODE: "QR Code", AUTRE: "Autre"
};

export const SOURCE_ICON = {
  FACEBOOK: "📘", INSTAGRAM: "📸", TIKTOK: "🎵",
  SITE_WEB: "🌐", WHATSAPP: "💬", QR_CODE: "📲", AUTRE: "📌"
};

/* ═══ INPUT ═══ */
export const Input = ({ label, type = "text", value, onChange, placeholder, required, style = {} }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>
        {label}{required && " *"}
      </label>
    )}
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      style={{
        width: "100%", padding: "10px 14px",
        background: "var(--bg3)", border: "1px solid var(--border)",
        borderRadius: 10, color: "var(--text)", fontSize: 13,
        fontFamily: "Inter, sans-serif", outline: "none",
        transition: "border-color 0.2s", ...style
      }}
      onFocus={e => e.target.style.borderColor = "var(--accent)"}
      onBlur={e => e.target.style.borderColor = "var(--border)"}
    />
  </div>
);

export const Select = ({ label, value, onChange, children, required, style = {} }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>
        {label}{required && " *"}
      </label>
    )}
    <select
      value={value} onChange={onChange} required={required}
      style={{
        width: "100%", padding: "10px 14px",
        background: "var(--bg3)", border: "1px solid var(--border)",
        borderRadius: 10, color: "var(--text)", fontSize: 13,
        fontFamily: "Inter, sans-serif", outline: "none", cursor: "pointer", ...style
      }}
    >
      {children}
    </select>
  </div>
);

export const Textarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>
        {label}
      </label>
    )}
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{
        width: "100%", padding: "10px 14px",
        background: "var(--bg3)", border: "1px solid var(--border)",
        borderRadius: 10, color: "var(--text)", fontSize: 13,
        fontFamily: "Inter, sans-serif", outline: "none",
        resize: "vertical", transition: "border-color 0.2s"
      }}
      onFocus={e => e.target.style.borderColor = "var(--accent)"}
      onBlur={e => e.target.style.borderColor = "var(--border)"}
    />
  </div>
);

/* ═══ MODAL ═══ */
export const Modal = ({ open, onClose, title, children, maxWidth = 520 }) => {
  if (!open) return null;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)", padding: 16
      }}
    >
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border2)",
        borderRadius: 20, padding: 28, width: "100%", maxWidth,
        maxHeight: "90vh", overflowY: "auto",
        animation: "fadeUp 0.2s ease", boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text3)", padding: 4, borderRadius: 6 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ═══ TOAST ═══ */
let toastFn = null;
export const useToast = () => {
  const show = (msg, icon = "✅", color = "var(--green)") => {
    if (toastFn) toastFn(msg, icon, color);
  };
  return { show };
};

export const ToastContainer = () => {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    toastFn = (msg, icon, color) => {
      setToast({ msg, icon, color });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 3000);
    };
    return () => { toastFn = null; clearTimeout(timer.current); };
  }, []);

  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: "var(--bg2)", border: "1px solid var(--border2)",
      borderLeft: `4px solid ${toast.color}`,
      borderRadius: 14, padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 12,
      zIndex: 600, fontSize: 13, fontWeight: 600,
      boxShadow: "var(--shadow-lg)", minWidth: 240,
      animation: "fadeUp 0.3s ease"
    }}>
      <span style={{ fontSize: 18 }}>{toast.icon}</span>
      <span>{toast.msg}</span>
      <button onClick={() => setToast(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 18 }}>×</button>
    </div>
  );
};

/* ═══ LOADING ═══ */
export const Spinner = ({ size = 20 }) => (
  <div style={{
    width: size, height: size, border: `2px solid var(--border)`,
    borderTop: `2px solid var(--accent)`, borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }} />
);

export const LoadingPage = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
    <Spinner size={32} />
    <span style={{ color: "var(--text2)", fontSize: 14 }}>Chargement...</span>
  </div>
);

/* ═══ EMPTY STATE ═══ */
export const EmptyState = ({ icon = "📭", title, description, action }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>{icon}</div>
    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
    {description && <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20, maxWidth: 300 }}>{description}</p>}
    {action}
  </div>
);

/* ═══ KPI CARD ═══ */
export const KpiCard = ({ icon, label, value, delta, deltaUp = true, color = "var(--accent)" }) => (
  <div style={{
    background: "var(--bg2)", border: "1px solid var(--border)",
    borderRadius: 14, padding: 18, position: "relative",
    overflow: "hidden", transition: "all 0.2s", cursor: "default"
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "14px 14px 0 0" }} />
    <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12, background: color + "18" }}>{icon}</div>
    <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
    {delta && <div style={{ fontSize: 11, fontWeight: 700, color: deltaUp ? "var(--green)" : "var(--red)" }}>{delta}</div>}
  </div>
);

/* ═══ PAGE HEADER ═══ */
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
    <div>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: "var(--text2)" }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>{actions}</div>}
  </div>
);

/* ═══ DATA TABLE ═══ */
export const Table = ({ headers, children, empty }) => (
  <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
      <thead>
        <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".5px", whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
    {empty}
  </div>
);

export const Td = ({ children, style = {} }) => (
  <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", verticalAlign: "middle", ...style }}>{children}</td>
);

/* ═══ TOGGLE ═══ */
export const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44, height: 24, borderRadius: 12,
      background: checked ? "var(--green)" : "var(--surface)",
      position: "relative", cursor: "pointer",
      transition: "background 0.2s", border: "none", flexShrink: 0
    }}
  >
    <div style={{
      position: "absolute", top: 3, left: checked ? 23 : 3,
      width: 18, height: 18, borderRadius: "50%", background: "#fff",
      transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)"
    }} />
  </button>
);
