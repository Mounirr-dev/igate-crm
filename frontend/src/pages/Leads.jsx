import { useState, useEffect, useCallback } from "react";
import { leadsService, usersService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Button, Badge, Modal, Input, Select, Textarea, EmptyState, Spinner, STATUT_BADGE, STATUT_LABEL, SOURCE_LABEL, SOURCE_ICON, useToast } from "../components/UI";

const STATUTS = ["NOUVEAU","A_APPELER","CONTACTE","INTERESSE","RDV","PAIEMENT","INSCRIT","PERDU"];
const SOURCES = ["FACEBOOK","INSTAGRAM","TIKTOK","SITE_WEB","WHATSAPP","QR_CODE","AUTRE"];
const FORMATIONS = ["TS Développement Informatique","TS Gestion des Entreprises","TS Infirmier Polyvalent","Technicien Aide Comptable","Qualification Aide Soignant"];

const EMPTY_FORM = { nom:"",tel:"",email:"",ville:"",formation:FORMATIONS[0],statut:"NOUVEAU",source:"SITE_WEB",notes:"",userId:"" };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreSource, setFiltreSource] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [users, setUsers] = useState([]);
  const { canEdit, canDelete, isDirecteur, isCommercial } = useAuth();
  const { show: toast } = useToast();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filtreStatut) params.statut = filtreStatut;
      if (filtreSource) params.source = filtreSource;
      const res = await leadsService.getAll(params);
      setLeads(res.data.data);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filtreStatut, filtreSource]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    if (!isCommercial() && !isDirecteur()) {
      usersService.getAll().then(r => setUsers(r.data)).catch(() => {});
    }
  }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (l) => {
    setEditId(l.id);
    setForm({ nom: l.nom, tel: l.tel, email: l.email||"", ville: l.ville||"", formation: l.formation, statut: l.statut, source: l.source, notes: l.notes||"", userId: l.userId||"" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.tel || !form.formation) { toast("Nom, téléphone et formation requis","⚠️","var(--amber)"); return; }
    setSaving(true);
    try {
      if (editId) { await leadsService.update(editId, form); toast("Lead mis à jour","✅","var(--green)"); }
      else { await leadsService.create(form); toast("Lead créé !","✅","var(--green)"); }
      setShowModal(false);
      fetchLeads();
    } catch (e) { toast(e.response?.data?.error || "Erreur","❌","var(--red)"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce prospect ?")) return;
    try {
      await leadsService.delete(id);
      toast("Lead supprimé","🗑","var(--red)");
      if (selectedLead?.id === id) setSelectedLead(null);
      fetchLeads();
    } catch (e) { toast(e.response?.data?.error || "Erreur","❌","var(--red)"); }
  };

  const handleStatutChange = async (id, statut) => {
    try {
      await leadsService.updateStatut(id, statut);
      toast(`Statut → ${STATUT_LABEL[statut]}`,"✓","var(--green)");
      fetchLeads();
    } catch (e) { toast("Erreur","❌","var(--red)"); }
  };

  const exportCSV = () => {
    const headers = ["ID","Nom","Email","Tél","Formation","Statut","Source","Date"];
    const rows = leads.map(l => [l.id, l.nom, l.email||"", l.tel, l.formation, l.statut, l.source, new Date(l.createdAt).toLocaleDateString("fr-FR")]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "nexcrm-leads.csv"; a.click();
    toast("CSV téléchargé","📥","var(--accent)");
  };

  const inp = (key) => e => setForm({ ...form, [key]: e.target.value });

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Prospects</h1>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>{total} prospect(s)</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={exportCSV}>📥 CSV</Button>
            {canEdit() && <Button size="sm" onClick={openCreate}>+ Nouveau lead</Button>}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
            style={{ flex: 1, minWidth: 180, padding: "8px 14px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}
            style={{ padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", cursor: "pointer" }}>
            <option value="">Tous statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
          </select>
          <select value={filtreSource} onChange={e => setFiltreSource(e.target.value)}
            style={{ padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", cursor: "pointer" }}>
            <option value="">Toutes sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {SOURCE_LABEL[s]}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, gap: 12 }}>
              <Spinner /><span style={{ color: "var(--text2)" }}>Chargement...</span>
            </div>
          ) : leads.length === 0 ? (
            <EmptyState icon="👥" title="Aucun prospect trouvé" description="Ajoutez votre premier prospect ou modifiez vos filtres"
              action={canEdit() && <Button onClick={openCreate}>+ Ajouter un prospect</Button>}
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                    {["Prospect","Tél","Formation","Statut","Source","Commercial","Actions"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".5px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l, i) => (
                    <tr key={l.id} onClick={() => setSelectedLead(l)}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", background: selectedLead?.id === l.id ? "rgba(59,130,246,.05)" : i % 2 === 0 ? "var(--bg2)" : "var(--bg3)", transition: "background 0.1s" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600 }}>{l.nom}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{l.email}</div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text2)", fontSize: 12 }}>{l.tel}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, background: "rgba(59,130,246,.08)", color: "var(--accent)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                          {l.formation?.replace("TS ","").slice(0, 20)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {canEdit() && !isDirecteur() ? (
                          <select value={l.statut} onChange={e => { e.stopPropagation(); handleStatutChange(l.id, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "var(--text)", fontFamily: "Inter, sans-serif", outline: "none" }}>
                            {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
                          </select>
                        ) : (
                          <Badge color={STATUT_BADGE[l.statut] || "gray"}>{STATUT_LABEL[l.statut] || l.statut}</Badge>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text2)" }}>
                        {SOURCE_ICON[l.source]} {SOURCE_LABEL[l.source]}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text2)" }}>
                        {l.conseiller?.nom?.split(" ")[0] || "—"}
                      </td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 5 }}>
                          {canEdit() && <Button variant="secondary" size="sm" style={{ padding: "5px 8px" }} onClick={() => openEdit(l)}>✏️</Button>}
                          {canDelete() && <Button variant="danger" size="sm" style={{ padding: "5px 8px" }} onClick={() => handleDelete(l.id)}>🗑</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedLead && (
        <div style={{ width: 300, flexShrink: 0 }}>
          <div className="card" style={{ position: "sticky", top: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700 }}>Détails</h3>
              <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text3)" }}>✕</button>
            </div>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent2))", color: "#fff", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              {selectedLead.nom?.charAt(0)}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedLead.nom}</div>
            <Badge color={STATUT_BADGE[selectedLead.statut] || "gray"}>{STATUT_LABEL[selectedLead.statut]}</Badge>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "📞", label: "Tél", val: selectedLead.tel },
                { icon: "📧", label: "Email", val: selectedLead.email || "—" },
                { icon: "📚", label: "Formation", val: selectedLead.formation },
                { icon: "📡", label: "Source", val: `${SOURCE_ICON[selectedLead.source]} ${SOURCE_LABEL[selectedLead.source]}` },
                { icon: "👤", label: "Commercial", val: selectedLead.conseiller?.nom || "—" },
                { icon: "📅", label: "Date", val: new Date(selectedLead.createdAt).toLocaleDateString("fr-FR") },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ fontSize: 13 }}>
                  <span style={{ color: "var(--text3)", marginRight: 6 }}>{icon}</span>
                  <strong style={{ color: "var(--text2)" }}>{label} : </strong>
                  <span style={{ color: "var(--text)" }}>{val}</span>
                </div>
              ))}
            </div>
            {selectedLead.notes && (
              <div style={{ marginTop: 14, background: "var(--bg3)", borderRadius: 10, padding: 12, fontSize: 13, color: "var(--text2)", borderLeft: "3px solid var(--amber)" }}>
                💬 {selectedLead.notes}
              </div>
            )}
            {canEdit() && (
              <Button style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={() => openEdit(selectedLead)}>
                ✏️ Modifier
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Modifier le prospect" : "Nouveau prospect"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Nom complet *" value={form.nom} onChange={inp("nom")} placeholder="Karim Benali" required />
          <Input label="Téléphone *" value={form.tel} onChange={inp("tel")} placeholder="0612345678" required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={inp("email")} placeholder="email@exemple.com" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select label="Formation *" value={form.formation} onChange={inp("formation")} required>
            {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </Select>
          <Select label="Source" value={form.source} onChange={inp("source")}>
            {SOURCES.map(s => <option key={s} value={s}>{SOURCE_ICON[s]} {SOURCE_LABEL[s]}</option>)}
          </Select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Select label="Statut" value={form.statut} onChange={inp("statut")}>
            {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
          </Select>
          {users.length > 0 && (
            <Select label="Commercial" value={form.userId} onChange={inp("userId")}>
              <option value="">Auto (Round Robin)</option>
              {users.filter(u => u.role === "COMMERCIAL").map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
            </Select>
          )}
        </div>
        <Textarea label="Notes" value={form.notes} onChange={inp("notes")} placeholder="Observations, rappels..." />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button style={{ flex: 2, justifyContent: "center" }} onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement..." : editId ? "💾 Enregistrer" : "✅ Créer le prospect"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
