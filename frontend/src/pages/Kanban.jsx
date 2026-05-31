import { useState, useEffect } from "react";
import { leadsService } from "../services/api";
import { Badge, STATUT_LABEL, SOURCE_ICON, SOURCE_LABEL, useToast, Spinner, EmptyState } from "../components/UI";

const STATUTS = ["NOUVEAU","A_APPELER","CONTACTE","INTERESSE","RDV","PAIEMENT","INSCRIT"];
const COLORS = {
  NOUVEAU: "#3b82f6", A_APPELER: "#7c3aed", CONTACTE: "#f59e0b",
  INTERESSE: "#ec4899", RDV: "#ec4899", PAIEMENT: "#06b6d4", INSCRIT: "#10b981"
};

export default function Kanban() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);
  const { show: toast } = useToast();

  useEffect(() => {
    leadsService.getAll({ limit: 200 })
      .then(r => setLeads(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDrop = async (newStatut) => {
    if (!dragId) return;
    const prev = leads.find(l => l.id === dragId)?.statut;
    if (prev === newStatut) { setDragId(null); setDraggingOver(null); return; }
    setLeads(ls => ls.map(l => l.id === dragId ? { ...l, statut: newStatut } : l));
    try {
      await leadsService.updateStatut(dragId, newStatut);
      toast(`→ ${STATUT_LABEL[newStatut]}`, "✓", "var(--green)");
    } catch {
      setLeads(ls => ls.map(l => l.id === dragId ? { ...l, statut: prev } : l));
      toast("Erreur", "❌", "var(--red)");
    }
    setDragId(null); setDraggingOver(null);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, gap: 12 }}>
      <Spinner size={28} /><span style={{ color: "var(--text2)" }}>Chargement...</span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Pipeline Kanban</h1>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>Glissez les cartes pour changer le statut</p>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, minHeight: "calc(100vh - 200px)" }}>
        {STATUTS.map(statut => {
          const cards = leads.filter(l => l.statut === statut);
          const c = COLORS[statut];
          const isOver = draggingOver === statut;
          return (
            <div key={statut}
              onDragOver={e => { e.preventDefault(); setDraggingOver(statut); }}
              onDragLeave={() => setDraggingOver(null)}
              onDrop={() => handleDrop(statut)}
              style={{
                minWidth: 200, width: 200, flexShrink: 0,
                background: isOver ? c + "0a" : "var(--bg3)",
                border: `1px ${isOver ? "dashed" : "solid"} ${isOver ? c : "var(--border)"}`,
                borderRadius: 14, display: "flex", flexDirection: "column",
                transition: "all 0.15s"
              }}
            >
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${c}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: c }}>{STATUT_LABEL[statut]}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: c + "18", color: c }}>{cards.length}</span>
              </div>
              <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: "calc(100vh - 280px)" }}>
                {cards.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 12, padding: "20px 8px", border: "1.5px dashed var(--border2)", borderRadius: 10 }}>
                    Déposer ici
                  </div>
                )}
                {cards.map(l => (
                  <div key={l.id}
                    draggable
                    onDragStart={() => { setDragId(l.id); }}
                    onDragEnd={() => { setDragId(null); setDraggingOver(null); }}
                    style={{
                      background: "var(--bg2)", border: "1px solid var(--border)",
                      borderRadius: 10, padding: 12, cursor: "grab",
                      borderLeft: `3px solid ${c}`, transition: "all 0.15s",
                      opacity: dragId === l.id ? 0.4 : 1,
                      userSelect: "none"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{l.nom}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3 }}>
                      📚 {l.formation?.replace("TS ","").slice(0, 22)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>📞 {l.tel}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: c, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {l.conseiller?.nom?.split(" ").map(w => w[0]).join("").slice(0, 2) || "?"}
                      </div>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: c + "15", color: c, fontWeight: 600 }}>
                        {SOURCE_ICON[l.source]} {SOURCE_LABEL[l.source]?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
