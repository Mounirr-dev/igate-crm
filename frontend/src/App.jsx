import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import { ToastContainer } from "./components/UI";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Kanban from "./pages/Kanban";
import PublicForm from "./pages/PublicForm";
import { Stats, Users, Settings, Integrations } from "./pages/OtherPages";

// Protected route wrapper
const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
      <div style={{ width: 28, height: 28, border: "2px solid var(--border)", borderTop: "2px solid var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <span style={{ color: "var(--text2)" }}>Chargement...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/form/:slug" element={<PublicForm />} />

      {/* Protected - All roles */}
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/stats" element={<Protected><Stats /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />

      {/* Leads - All except COMPTABILITE */}
      <Route path="/leads" element={
        <Protected roles={["PLATFORM_OWNER","COMPANY_ADMIN","DIRECTEUR","COMMERCIAL"]}>
          <Leads />
        </Protected>
      } />

      {/* Kanban - Admin, Commercial */}
      <Route path="/kanban" element={
        <Protected roles={["PLATFORM_OWNER","COMPANY_ADMIN","COMMERCIAL"]}>
          <Kanban />
        </Protected>
      } />

      {/* Users - Admin only */}
      <Route path="/users" element={
        <Protected roles={["PLATFORM_OWNER","COMPANY_ADMIN"]}>
          <Users />
        </Protected>
      } />

      {/* Integrations - Admin only */}
      <Route path="/integrations" element={
        <Protected roles={["PLATFORM_OWNER","COMPANY_ADMIN"]}>
          <Integrations />
        </Protected>
      } />

      {/* Finance - Comptabilite, Admin */}
      <Route path="/finance" element={
        <Protected roles={["PLATFORM_OWNER","COMPANY_ADMIN","COMPTABILITE","COMMERCIAL"]}>
          <div style={{ padding: 24 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Finance & Paiements</h1>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Module Finance</h3>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>Gestion des paiements et inscriptions — en cours de développement</p>
            </div>
          </div>
        </Protected>
      } />

      {/* Companies - Owner only */}
      <Route path="/companies" element={
        <Protected roles={["PLATFORM_OWNER"]}>
          <div style={{ padding: 24 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Entreprises</h1>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Gestion des écoles clientes</h3>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>Vue de toutes les écoles abonnées à NexCRM</p>
            </div>
          </div>
        </Protected>
      } />

      {/* Billing - Owner */}
      <Route path="/billing" element={
        <Protected roles={["PLATFORM_OWNER"]}>
          <div style={{ padding: 24 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Facturation SaaS</h1>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>MRR & Abonnements</h3>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>Gestion des abonnements et revenus SaaS</p>
            </div>
          </div>
        </Protected>
      } />

      {/* Automations */}
      <Route path="/automations" element={
        <Protected roles={["PLATFORM_OWNER","COMPANY_ADMIN"]}>
          <div style={{ padding: 24 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>⚡ Automatisations</h1>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Workflows n8n</h3>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>Rappels automatiques, emails, assignation — bientôt disponible</p>
            </div>
          </div>
        </Protected>
      } />

      {/* Permissions */}
      <Route path="/permissions" element={
        <Protected roles={["PLATFORM_OWNER"]}>
          <div style={{ padding: 24 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Permissions & Rôles</h1>
          </div>
        </Protected>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}
