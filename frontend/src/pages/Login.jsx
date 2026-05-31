import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DEMO_ACCOUNTS = [
  { role: "👑 Platform Owner", email: "owner@nexcrm.com", pass: "owner123" },
  { role: "🏫 Company Admin", email: "admin@ecolea.ma", pass: "admin123" },
  { role: "📊 Directeur", email: "dir@ecolea.ma", pass: "dir123" },
  { role: "🤝 Commercial", email: "com@ecolea.ma", pass: "crm123" },
  { role: "💰 Comptabilité", email: "compta@ecolea.ma", pass: "compta123" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); setError(""); };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
      position: "relative", overflow: "hidden", padding: 16
    }}>
      {/* Background glows */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "var(--accent)", top: -150, right: -100, filter: "blur(120px)", opacity: 0.1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "var(--accent2)", bottom: -100, left: -100, filter: "blur(120px)", opacity: 0.1, pointerEvents: "none" }} />

      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border2)",
        borderRadius: 20, padding: "44px 40px", width: "100%",
        maxWidth: 460, position: "relative", zIndex: 1,
        boxShadow: "0 12px 40px rgba(0,0,0,.12)"
      }}>
        {/* Logo */}
        <div style={{ width: 54, height: 54, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", boxShadow: "0 6px 24px rgba(59,130,246,.3)" }}>N</div>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>NexCRM Pro</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", textAlign: "center", marginBottom: 28 }}>Plateforme commerciale SaaS multi-tenant</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@nexcrm.com" required
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: "100%", padding: "10px 14px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", color: "var(--red)", fontSize: 12, padding: "10px 14px", borderRadius: 10, marginBottom: 14, textAlign: "center", fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", borderRadius: 10,
            background: "var(--accent)", border: "none", color: "#fff",
            fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            {loading ? "Connexion..." : "Se connecter →"}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 14, marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Comptes démo</div>
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
              <span style={{ color: "var(--text2)" }}>{acc.role} · {acc.email}</span>
              <button onClick={() => fill(acc.email, acc.pass)} style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Utiliser
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
