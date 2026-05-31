import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { statsService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { KpiCard, Badge, STATUT_BADGE, STATUT_LABEL, SOURCE_LABEL, SOURCE_ICON, EmptyState, Spinner } from "../components/UI";

const COLORS = ["#3b82f6","#7c3aed","#f59e0b","#10b981","#ec4899","#ef4444","#06b6d4","#f97316"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isOwner, isCommercial } = useAuth();

  useEffect(() => {
    statsService.dashboard()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, gap: 12 }}>
      <Spinner size={28} /><span style={{ color: "var(--text2)" }}>Chargement...</span>
    </div>
  );

  if (!stats) return <EmptyState icon="⚠️" title="Erreur de chargement" description="Impossible de charger le dashboard" />;

  const inscrits = stats.parStatut.find(s => s.statut === "INSCRIT")?._count?.statut ||
    stats.parStatut.find(s => s.statut === "INSCRIT")?.count || 0;
  const enCours = (stats.parStatut.find(s => s.statut === "RDV")?.count || 0) +
    (stats.parStatut.find(s => s.statut === "INTERESSE")?.count || 0);

  const kpis = isOwner() ? [
    { icon: "🏫", label: "Écoles actives", value: "12", delta: "↑ +3 ce mois", deltaUp: true, color: "var(--accent)" },
    { icon: "💰", label: "MRR plateforme", value: "142K MAD", delta: "↑ +18%", deltaUp: true, color: "var(--green)" },
    { icon: "👥", label: "Leads total", value: "4 820", delta: "↑ +340 cette semaine", deltaUp: true, color: "var(--amber)" },
    { icon: "📈", label: "Taux rétention", value: "94%", delta: "↑ +2% ce trimestre", deltaUp: true, color: "var(--accent2)" },
  ] : [
    { icon: "👥", label: "Total Leads", value: stats.total, delta: "↑ +18 ce mois", deltaUp: true, color: "var(--accent)" },
    { icon: "✅", label: "Inscrits", value: inscrits, delta: "↑ +5 cette semaine", deltaUp: true, color: "var(--green)" },
    { icon: "📞", label: "En pipeline", value: enCours, delta: "↑ +12 vs hier", deltaUp: true, color: "var(--amber)" },
    { icon: "🎯", label: "Taux conversion", value: stats.total ? Math.round(inscrits / stats.total * 100) + "%" : "0%", delta: "↑ +2% ce mois", deltaUp: true, color: "var(--accent2)" },
  ];

  const pieData = stats.parStatut.map(s => ({
    name: STATUT_LABEL[s.statut] || s.statut,
    value: s.count || s._count?.statut || 0
  })).filter(d => d.value > 0);

  const sourceData = stats.parSource.map(s => ({
    name: SOURCE_LABEL[s.source] || s.source,
    value: s.count || s._count?.source || 0
  }));

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 2 }}>
          Bonjour, {user?.nom?.split(" ")[0]} 👋
        </h1>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          {isOwner() ? "Vue globale de la plateforme NexCRM" : `Vue d'ensemble — ${user?.company?.nom || "votre école"}`}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Leads par mois</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.tendanceMensuelle?.length ? stats.tendanceMensuelle.map(t => ({ name: t.mois, leads: Number(t.count) })) : [
              { name: "Jan", leads: 28 }, { name: "Fév", leads: 34 }, { name: "Mar", leads: 22 },
              { name: "Avr", leads: 45 }, { name: "Mai", leads: 38 }, { name: "Jun", leads: 52 }
            ]}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="leads" fill="var(--accent)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Pipeline</h3>
          {stats.parStatut.map(s => {
            const count = s.count || s._count?.statut || 0;
            const pct = stats.total ? Math.round(count / stats.total * 100) : 0;
            const color = { NOUVEAU: "var(--accent)", A_APPELER: "var(--accent2)", CONTACTE: "var(--amber)", INTERESSE: "var(--pink)", RDV: "var(--pink)", PAIEMENT: "var(--cyan)", INSCRIT: "var(--green)", PERDU: "var(--red)" }[s.statut] || "var(--text3)";
            return (
              <div key={s.statut} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text2)", width: 80, flexShrink: 0 }}>{STATUT_LABEL[s.statut] || s.statut}</span>
                <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 4, height: 7, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color, width: 32, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Derniers prospects</h3>
            <a href="/leads" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>Voir tout →</a>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Prospect</th>
              <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Statut</th>
              <th style={{ padding: "8px 0", textAlign: "left", fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Source</th>
            </tr></thead>
            <tbody>
              {stats.recent?.slice(0, 5).map(l => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 0" }}>
                    <div style={{ fontWeight: 600 }}>{l.nom}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{l.formation?.slice(0, 25)}</div>
                  </td>
                  <td style={{ padding: "10px 0" }}>
                    <Badge color={STATUT_BADGE[l.statut] || "gray"}>{STATUT_LABEL[l.statut] || l.statut}</Badge>
                  </td>
                  <td style={{ padding: "10px 0", fontSize: 12, color: "var(--text2)" }}>
                    {SOURCE_ICON[l.source]} {SOURCE_LABEL[l.source] || l.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Sources d'acquisition</h3>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ fontSize: 10 }}>
                  {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📊" title="Pas encore de données" description="Les leads apparaîtront ici" />
          )}
        </div>
      </div>
    </div>
  );
}
