import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { formService } from "../services/api";

const NIVEAUX = ["Baccalauréat", "BAC +2", "BAC +3 et plus", "Autre"];

export default function PublicForm() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("src") || "site_web";

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "", tel: "", email: "", ville: "",
    formation: "", niveau: NIVEAUX[0], message: ""
  });

  useEffect(() => {
    formService.getConfig(slug)
      .then(r => setConfig(r.data))
      .catch(() => setError("Formulaire introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.tel || !form.formation) {
      setError("Nom, téléphone et formation sont requis"); return;
    }
    setSaving(true); setError("");
    try {
      await formService.submit(slug, { ...form, source });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi");
    } finally {
      setSaving(false);
    }
  };

  const inp = (key) => e => setForm({ ...form, [key]: e.target.value });
  const cfg = config?.formConfig;
  const couleur = cfg?.couleur || "#1a3a5c";

  const inputStyle = {
    width: "100%", padding: "12px 14px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 14, fontFamily: "Inter, sans-serif",
    outline: "none", color: "#0f172a", background: "#f8fafc",
    transition: "border-color 0.2s", marginBottom: 14,
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 700,
    color: "#475569", textTransform: "uppercase",
    letterSpacing: ".5px", marginBottom: 5
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: `3px solid ${couleur}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748b", fontFamily: "Inter, sans-serif" }}>Chargement...</p>
      </div>
    </div>
  );

  if (error && !config) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Formulaire introuvable</h2>
        <p style={{ color: "#64748b" }}>Ce lien n'existe pas ou a été désactivé.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 16, fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "44px 40px", maxWidth: 460, width: "100%", textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,.08)" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>Demande envoyée !</h2>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>
          Merci <strong>{form.nom}</strong> ! Notre équipe vous contactera très prochainement.
        </p>
        <div style={{ background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 12, padding: 16, textAlign: "left", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 8 }}>✅ Ce qui vient de se passer :</div>
          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
            • Votre demande a été reçue dans notre CRM<br />
            • Un conseiller vous a été assigné<br />
            • Vous serez contacté dans les 24h
          </div>
        </div>
        <button onClick={() => setSubmitted(false)} style={{ padding: "10px 24px", borderRadius: 10, background: couleur, border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
          Nouvelle demande
        </button>
      </div>
    </div>
  );

  const formations = cfg?.formations?.length > 0 ? cfg.formations : [
    "TS Développement Informatique", "TS Gestion des Entreprises",
    "TS Infirmier Polyvalent", "Technicien Aide Comptable", "Qualification Aide Soignant"
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { border-color: ${couleur} !important; background: #fff !important; }
      `}</style>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.08)" }}>

          {/* Header */}
          <div style={{ background: couleur, padding: "36px 32px", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, background: "rgba(255,255,255,.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🎓</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{config?.nom}</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.8)" }}>{cfg?.sousTitre || "Inscrivez-vous — Formations professionnelles 2026"}</p>
          </div>

          {/* Form */}
          <div style={{ padding: "32px 32px" }}>
            <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24 }}>
              {cfg?.description || "Remplissez ce formulaire et notre équipe vous contactera dans les 24h"}
            </p>

            {error && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Nom complet *</label>
              <input value={form.nom} onChange={inp("nom")} placeholder="Votre nom et prénom" required style={inputStyle} />

              <label style={labelStyle}>Téléphone *</label>
              <input value={form.tel} onChange={inp("tel")} placeholder="0612 345 678" required type="tel" style={inputStyle} />

              <label style={labelStyle}>Email</label>
              <input value={form.email} onChange={inp("email")} placeholder="votre@email.com" type="email" style={inputStyle} />

              <label style={labelStyle}>Ville</label>
              <input value={form.ville} onChange={inp("ville")} placeholder="Casablanca, Rabat..." style={inputStyle} />

              <label style={labelStyle}>Formation souhaitée *</label>
              <select value={form.formation} onChange={inp("formation")} required style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">-- Choisissez une formation --</option>
                {formations.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <label style={labelStyle}>Niveau d'études</label>
              <select value={form.niveau} onChange={inp("niveau")} style={{ ...inputStyle, cursor: "pointer" }}>
                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
              </select>

              <label style={labelStyle}>Message (optionnel)</label>
              <textarea value={form.message} onChange={inp("message")} placeholder="Questions, disponibilités..." rows={3}
                style={{ ...inputStyle, resize: "vertical" }} />

              <button type="submit" disabled={saving} style={{
                width: "100%", padding: "14px", borderRadius: 12,
                background: couleur, border: "none", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, fontFamily: "Inter, sans-serif",
                transition: "opacity 0.2s"
              }}>
                {saving ? "Envoi en cours..." : "Envoyer ma demande →"}
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
                🔒 Vos données sont protégées et confidentielles
              </p>
            </form>
          </div>
        </div>

        {/* Powered by */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 20 }}>
          Propulsé par <strong style={{ color: "#3b82f6" }}>NexCRM</strong>
        </p>
      </div>
    </div>
  );
}
