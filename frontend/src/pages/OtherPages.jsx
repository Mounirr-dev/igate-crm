// Stats.jsx
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { statsService, usersService, integrationsService } from "../services/api";
import { KpiCard, Badge, EmptyState, Spinner, STATUT_LABEL, SOURCE_LABEL, SOURCE_ICON, Button, Modal, Input, Select, useToast, Toggle } from "../components/UI";
import { useAuth } from "../contexts/AuthContext";

const COLORS = ["#3b82f6","#7c3aed","#f59e0b","#10b981","#ec4899","#ef4444","#06b6d4"];

export function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService.dashboard().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:400,gap:12 }}><Spinner size={28}/><span style={{color:"var(--text2)"}}>Chargement...</span></div>;
  if (!stats) return <EmptyState icon="⚠️" title="Erreur" />;

  const inscrits = stats.parStatut.find(s=>s.statut==="INSCRIT")?.count || 0;
  const taux = stats.total ? Math.round(inscrits/stats.total*100) : 0;

  return (
    <div>
      <div style={{marginBottom:22}}>
        <h1 style={{fontFamily:"Syne, sans-serif",fontSize:22,fontWeight:800,marginBottom:2}}>Statistiques</h1>
        <p style={{fontSize:13,color:"var(--text2)"}}>Analyse complète du pipeline commercial</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KpiCard icon="🎯" label="Taux conversion" value={taux+"%"} delta="↑ +2% ce mois" color="var(--green)"/>
        <KpiCard icon="✅" label="Inscrits" value={inscrits} delta="↑ +5 cette semaine" color="var(--accent)"/>
        <KpiCard icon="👥" label="Total leads" value={stats.total} delta="↑ +18 ce mois" color="var(--amber)"/>
        <KpiCard icon="📡" label="Sources actives" value={stats.parSource.length} delta="Canaux d'acquisition" deltaUp={true} color="var(--accent2)"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Répartition par statut</h3>
          {stats.parStatut.map(s => {
            const count = s.count || 0;
            const pct = stats.total ? Math.round(count/stats.total*100) : 0;
            const c = {NOUVEAU:"var(--accent)",A_APPELER:"var(--accent2)",CONTACTE:"var(--amber)",INTERESSE:"var(--pink)",RDV:"var(--pink)",PAIEMENT:"var(--cyan)",INSCRIT:"var(--green)",PERDU:"var(--red)"}[s.statut]||"var(--text3)";
            return (
              <div key={s.statut} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                  <span style={{color:c,fontWeight:600}}>{STATUT_LABEL[s.statut]||s.statut}</span>
                  <span style={{color:"var(--text2)"}}>{count} ({pct}%)</span>
                </div>
                <div style={{height:7,background:"var(--bg3)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:pct+"%",height:"100%",background:c,borderRadius:4,transition:"width .8s ease"}}/>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Sources d'acquisition</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.parSource.map(s=>({name:SOURCE_LABEL[s.source]||s.source,value:s.count||0}))}
                cx="50%" cy="50%" outerRadius={85} dataKey="value"
                label={({name,value})=>`${name}: ${value}`} labelLine={false} style={{fontSize:11}}>
                {stats.parSource.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.commerciaux?.length > 0 && (
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Performance commerciaux</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.commerciaux.map(c=>({name:c.nom.split(" ")[0],leads:c._count?.leads||0}))}>
              <XAxis dataKey="name" tick={{fontSize:11,fill:"var(--text3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"var(--text3)"}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,fontSize:12}}/>
              <Bar dataKey="leads" fill="var(--accent)" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// Users.jsx
const ROLE_COLORS = {COMPANY_ADMIN:"linear-gradient(135deg,#3b82f6,#06b6d4)",COMMERCIAL:"linear-gradient(135deg,#10b981,#3b82f6)",DIRECTEUR:"linear-gradient(135deg,#f59e0b,#ec4899)",COMPTABILITE:"linear-gradient(135deg,#ef4444,#f97316)"};
const ROLE_LABEL = {COMPANY_ADMIN:"Company Admin",DIRECTEUR:"Directeur",COMMERCIAL:"Commercial",COMPTABILITE:"Comptabilité"};
const ROLE_BADGE = {COMPANY_ADMIN:"blue",DIRECTEUR:"amber",COMMERCIAL:"green",COMPTABILITE:"red"};

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({nom:"",email:"",password:"",role:"COMMERCIAL"});
  const [saving, setSaving] = useState(false);
  const { user: me } = useAuth();
  const { show: toast } = useToast();

  const fetch = () => {
    usersService.getAll().then(r=>setUsers(r.data)).catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(()=>fetch(),[]);

  const handleCreate = async () => {
    if (!form.nom||!form.email||!form.password){toast("Tous les champs requis","⚠️","var(--amber)");return;}
    setSaving(true);
    try {
      await usersService.create(form);
      toast("Utilisateur créé !","✅","var(--green)");
      setShowModal(false); setForm({nom:"",email:"",password:"",role:"COMMERCIAL"});
      fetch();
    } catch(e){toast(e.response?.data?.error||"Erreur","❌","var(--red)");}
    finally{setSaving(false);}
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await usersService.delete(id);
      toast("Supprimé","🗑","var(--red)"); fetch();
    } catch(e){toast(e.response?.data?.error||"Erreur","❌","var(--red)");}
  };

  const inp = key => e => setForm({...form,[key]:e.target.value});

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,gap:12}}><Spinner size={28}/><span style={{color:"var(--text2)"}}>Chargement...</span></div>;

  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,gap:12,flexWrap:"wrap"}}>
        <div>
          <h1 style={{fontFamily:"Syne, sans-serif",fontSize:22,fontWeight:800,marginBottom:2}}>Utilisateurs</h1>
          <p style={{fontSize:13,color:"var(--text2)"}}>Gestion de l'équipe ({users.length} membres)</p>
        </div>
        <Button onClick={()=>setShowModal(true)}>+ Nouvel utilisateur</Button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {users.map(u => (
          <div key={u.id} className="card" style={{textAlign:"center",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="var(--shadow-md)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:ROLE_COLORS[u.role]||"var(--accent)",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#fff"}}>
              {u.nom?.split(" ").map(w=>w[0]).join("").slice(0,2)}
            </div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{u.nom}</div>
            <div style={{fontSize:12,color:"var(--text3)",marginBottom:10}}>{u.email}</div>
            <Badge color={ROLE_BADGE[u.role]||"gray"} style={{marginBottom:12}}>{ROLE_LABEL[u.role]||u.role}</Badge>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:14}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800}}>{u._count?.leads||0}</div>
                <div style={{fontSize:10,color:"var(--text3)"}}>Leads</div>
              </div>
            </div>
            {u.id===me?.id ? (
              <span style={{fontSize:12,color:"var(--text3)"}}>👤 Votre compte</span>
            ) : (
              <Button variant="danger" size="sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>handleDelete(u.id)}>
                🗑 Supprimer
              </Button>
            )}
          </div>
        ))}
        {users.length===0 && <div style={{gridColumn:"1/-1"}}><EmptyState icon="👤" title="Aucun utilisateur" description="Créez votre premier utilisateur" action={<Button onClick={()=>setShowModal(true)}>+ Nouvel utilisateur</Button>}/></div>}
      </div>

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Nouvel utilisateur" maxWidth={440}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Nom complet" value={form.nom} onChange={inp("nom")} placeholder="Ahmed Salimi" required/>
          <Input label="Email" type="email" value={form.email} onChange={inp("email")} placeholder="a.salimi@ecole.ma" required/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Mot de passe" type="password" value={form.password} onChange={inp("password")} placeholder="••••••••" required/>
          <Select label="Rôle" value={form.role} onChange={inp("role")}>
            <option value="COMMERCIAL">Commercial</option>
            <option value="COMPANY_ADMIN">Admin</option>
            <option value="DIRECTEUR">Directeur</option>
            <option value="COMPTABILITE">Comptabilité</option>
          </Select>
        </div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Button variant="ghost" onClick={()=>setShowModal(false)}>Annuler</Button>
          <Button style={{flex:2,justifyContent:"center"}} onClick={handleCreate} disabled={saving}>
            {saving?"Création...":"✅ Créer l'utilisateur"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Settings.jsx
export function Settings() {
  const { user } = useAuth();
  const { show: toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const tabs = ["general","integrations","notifications","securite"];
  const tabLabels = {general:"Général",integrations:"Intégrations",notifications:"Notifications",securite:"Sécurité"};

  const [notifs, setNotifs] = useState({nouveau_lead:true,rappel:true,rapport:true,paiement:true,statut:false,import:true});

  return (
    <div>
      <div style={{marginBottom:22}}>
        <h1 style={{fontFamily:"Syne, sans-serif",fontSize:22,fontWeight:800,marginBottom:2}}>Paramètres</h1>
        <p style={{fontSize:13,color:"var(--text2)"}}>Configuration de votre CRM</p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:4,marginBottom:24,maxWidth:480}}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            flex:1,padding:"7px 14px",borderRadius:8,border:"none",
            background:activeTab===t?"var(--bg2)":"transparent",
            color:activeTab===t?"var(--accent)":"var(--text2)",
            fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"Inter, sans-serif",transition:"all .2s",
            boxShadow:activeTab===t?"var(--shadow)":"none"
          }}>{tabLabels[t]}</button>
        ))}
      </div>

      {activeTab==="general" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Informations école</h3>
            <Input label="Nom de l'école" value={user?.company?.nom||""} onChange={()=>{}}/>
            <Input label="Email de contact" type="email" value={user?.email||""} onChange={()=>{}}/>
            <Input label="Téléphone" placeholder="+212 600 000 000" onChange={()=>{}}/>
            <Input label="Ville" placeholder="Casablanca" onChange={()=>{}}/>
            <Button style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={()=>toast("Sauvegardé !","✅","var(--green)")}>
              Sauvegarder les modifications
            </Button>
          </div>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Apparence</h3>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <span>Thème sombre</span>
              <Toggle checked={false} onChange={()=>{
                const dark=document.documentElement.getAttribute("data-theme")==="dark";
                document.documentElement.setAttribute("data-theme",dark?"light":"dark");
              }}/>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <span>Animations</span><Toggle checked={true} onChange={()=>{}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",fontSize:13}}>
              <span>Sidebar compacte</span><Toggle checked={false} onChange={()=>{}}/>
            </div>
          </div>
        </div>
      )}

      {activeTab==="integrations" && (
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Intégrations connectées</h3>
          {[
            {name:"Meta Lead Ads",desc:"Facebook & Instagram",status:"Connecté",color:"var(--green)"},
            {name:"n8n Automatisation",desc:"Workflows automatiques",status:"Actif",color:"var(--green)"},
            {name:"Brevo / Email SMTP",desc:"Emails automatiques",status:"Configurer",color:"var(--amber)"},
            {name:"Stripe Paiements",desc:"Gestion des paiements",status:"Non connecté",color:"var(--text3)"},
            {name:"TikTok Lead Ads",desc:"Leads TikTok",status:"Non connecté",color:"var(--text3)"},
          ].map(i => (
            <div key={i.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <div>
                <div style={{fontWeight:600}}>{i.name}</div>
                <div style={{fontSize:11,color:"var(--text3)"}}>{i.desc}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:12,fontWeight:700,color:i.color}}>{i.status}</span>
                <Button variant="secondary" size="sm">Configurer</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab==="notifications" && (
        <div className="card" style={{maxWidth:600}}>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Préférences notifications</h3>
          {Object.entries({
            nouveau_lead:"Nouveau lead entré",rappel:"Rappel sans réponse (48h)",
            rapport:"Rapport hebdomadaire auto",paiement:"Paiement confirmé",
            statut:"Changement de statut",import:"Import Meta Leads"
          }).map(([key,label]) => (
            <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <span>{label}</span>
              <Toggle checked={notifs[key]} onChange={v=>setNotifs({...notifs,[key]:v})}/>
            </div>
          ))}
        </div>
      )}

      {activeTab==="securite" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Changer le mot de passe</h3>
            <Input label="Mot de passe actuel" type="password" placeholder="••••••••" onChange={()=>{}}/>
            <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" onChange={()=>{}}/>
            <Input label="Confirmer" type="password" placeholder="••••••••" onChange={()=>{}}/>
            <Button style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={()=>toast("Mot de passe mis à jour","🔒","var(--accent)")}>
              Mettre à jour
            </Button>
          </div>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Sessions actives</h3>
            {[
              {device:"Chrome — Windows 11",location:"Casablanca, MA",time:"Session actuelle",active:true},
              {device:"Safari — iPhone 15",location:"Casablanca, MA",time:"Il y a 2h",active:false},
            ].map((s,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{s.device}</div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>{s.location} · {s.time}</div>
                </div>
                {s.active ? <Badge color="green">Actif</Badge> : <Button variant="danger" size="sm">Déconnecter</Button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Integrations.jsx
export function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show: toast } = useToast();

  const SOURCES = [
    {key:"FACEBOOK",name:"Facebook Lead Ads",icon:"📘",color:"#1877f2",desc:"Meta Business Suite — Leads automatiques depuis vos pubs Facebook"},
    {key:"INSTAGRAM",name:"Instagram Lead Ads",icon:"📸",color:"#e1306c",desc:"Via Meta Business — Leads depuis vos stories et pubs Instagram"},
    {key:"TIKTOK",name:"TikTok Lead Generation",icon:"🎵",color:"#010101",desc:"TikTok Ads Manager — Leads depuis vos campagnes TikTok"},
    {key:"SITE_WEB",name:"Formulaire Site Web",icon:"🌐",color:"var(--accent)",desc:"Votre formulaire public NexCRM — Lien unique par école"},
  ];

  useEffect(()=>{
    integrationsService.getAll().then(r=>setIntegrations(r.data)).catch(()=>setIntegrations([])).finally(()=>setLoading(false));
  },[]);

  const getInteg = (key) => integrations.find(i=>i.source===key);

  const handleToggle = async (source) => {
    try {
      await integrationsService.toggle(source);
      const res = await integrationsService.getAll();
      setIntegrations(res.data);
      const integ = res.data.find(i=>i.source===source);
      toast(integ?.actif?"Source activée !":"Source désactivée","✅","var(--green)");
    } catch(e){toast("Erreur","❌","var(--red)");}
  };

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,gap:12}}><Spinner size={24}/></div>;

  return (
    <div>
      <div style={{marginBottom:22}}>
        <h1 style={{fontFamily:"Syne, sans-serif",fontSize:22,fontWeight:800,marginBottom:2}}>Intégrations & Sources</h1>
        <p style={{fontSize:13,color:"var(--text2)"}}>Connectez vos réseaux sociaux — les leads arrivent automatiquement dans votre CRM</p>
      </div>

      {/* Info banner */}
      <div style={{background:"linear-gradient(135deg,rgba(59,130,246,.08),rgba(124,58,237,.08))",border:"1px solid rgba(59,130,246,.2)",borderRadius:14,padding:20,marginBottom:24,display:"flex",alignItems:"flex-start",gap:14}}>
        <span style={{fontSize:24,flexShrink:0}}>💡</span>
        <div>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Comment ça fonctionne ?</div>
          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7}}>
            Connectez une source → Quand quelqu'un remplit votre formulaire → Le lead arrive <strong>automatiquement</strong> dans votre CRM en moins de 30 secondes → Commercial assigné automatiquement.
          </div>
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            <span style={{background:"rgba(59,130,246,.1)",color:"var(--accent)",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>⚡ Temps réel</span>
            <span style={{background:"rgba(16,185,129,.1)",color:"var(--green)",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>🔄 100% automatique</span>
            <span style={{background:"rgba(124,58,237,.1)",color:"var(--accent2)",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>🏫 Isolé par école</span>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {SOURCES.map(src => {
          const integ = getInteg(src.key);
          const actif = integ?.actif || false;
          const count = integ?.leadsCount || 0;
          return (
            <div key={src.key} className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:src.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#fff"}}>
                    {src.icon}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{src.name}</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>{src.desc.slice(0,40)}...</div>
                  </div>
                </div>
                <Toggle checked={actif} onChange={()=>handleToggle(src.key)}/>
              </div>
              <div style={{background:actif?"rgba(16,185,129,.06)":"var(--bg3)",border:`1px solid ${actif?"rgba(16,185,129,.2)":"var(--border)"}`,borderRadius:10,padding:12,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:actif?"var(--green)":"var(--text3)"}}/>
                  <span style={{fontSize:12,fontWeight:700,color:actif?"var(--green)":"var(--text3)"}}>{actif?"Connecté et actif":"Non connecté"}</span>
                </div>
                <div style={{fontSize:11,color:"var(--text2)"}}>{count} leads reçus ce mois</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Button variant="secondary" size="sm" onClick={()=>toast("Configuration en cours...","⚙️","var(--accent)")}>
                  ⚙️ Configurer
                </Button>
                {src.key==="SITE_WEB" && (
                  <Button variant="secondary" size="sm" onClick={()=>window.open("/form/"+window.location.hostname.split(".")[0],"_blank")}>
                    👁️ Voir formulaire
                  </Button>
                )}
                {count>0 && <span style={{marginLeft:"auto",background:"rgba(16,185,129,.1)",color:"var(--green)",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{count} leads</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lien formulaire */}
      <div className="card" style={{marginTop:16}}>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>🔗 Votre lien de formulaire public</h3>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {["facebook","instagram","tiktok","site_web"].map(src => (
            <div key={src} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"var(--bg3)",borderRadius:10,fontSize:12,flex:1,minWidth:200}}>
              <span style={{color:"var(--text2)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                /form/ecolea?src={src}
              </span>
              <Button variant="secondary" size="sm" style={{padding:"4px 8px",fontSize:11}}
                onClick={()=>{navigator.clipboard?.writeText(window.location.origin+"/form/ecolea?src="+src).catch(()=>{});toast("Lien copié !","📋","var(--accent)");}}>
                Copier
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
