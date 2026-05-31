# NexCRM Pro — SaaS Platform

Plateforme CRM SaaS multi-tenant pour écoles et centres de formation.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ → https://nodejs.org
- PostgreSQL 15+ → https://postgresql.org

---

## 📦 Installation

### Option 1 — Script automatique (Windows)
Double-cliquez sur `setup.bat` et suivez les instructions.

### Option 2 — Manuel

#### 1. Base de données
Ouvrez PowerShell et tapez :
```powershell
# Ajouter PostgreSQL au PATH (remplacez 17 par votre version)
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"

# Se connecter
psql -U postgres

# Dans psql, tapez ces commandes :
CREATE USER nexcrm WITH PASSWORD 'nexcrm2026';
CREATE DATABASE nexcrm_db OWNER nexcrm;
GRANT ALL PRIVILEGES ON DATABASE nexcrm_db TO nexcrm;
\q
```

#### 2. Backend
```powershell
cd nexcrm\backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

#### 3. Frontend (nouveau terminal)
```powershell
cd nexcrm\frontend
npm install
npm run dev
```

#### 4. Ouvrir le navigateur
```
http://localhost:5173
```

---

## 🔑 Comptes de connexion

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👑 Platform Owner | owner@nexcrm.com | owner123 |
| 🏫 Company Admin | admin@ecolea.ma | admin123 |
| 📊 Directeur | dir@ecolea.ma | dir123 |
| 🤝 Commercial | com@ecolea.ma | crm123 |
| 🤝 Commercial 2 | com2@ecolea.ma | crm123 |
| 💰 Comptabilité | compta@ecolea.ma | compta123 |

---

## 🌐 URLs importantes

| Page | URL |
|------|-----|
| Application | http://localhost:5173 |
| API Backend | http://localhost:4000 |
| Health Check | http://localhost:4000/health |
| Formulaire public École A | http://localhost:5173/form/ecolea |
| Formulaire via Facebook | http://localhost:5173/form/ecolea?src=facebook |
| Formulaire via Instagram | http://localhost:5173/form/ecolea?src=instagram |
| Formulaire via TikTok | http://localhost:5173/form/ecolea?src=tiktok |
| Prisma Studio | http://localhost:5555 (npx prisma studio) |

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/login          → Connexion
GET  /api/auth/me             → Profil connecté
POST /api/auth/change-password → Changer mot de passe
```

### Leads
```
GET    /api/leads              → Liste (filtres: search, statut, source)
GET    /api/leads/:id          → Détail + activités
POST   /api/leads              → Créer
PUT    /api/leads/:id          → Modifier
PATCH  /api/leads/:id/statut   → Changer statut
DELETE /api/leads/:id          → Supprimer
POST   /api/leads/:id/activites → Ajouter note/appel
```

### Stats
```
GET /api/stats/dashboard  → KPIs + charts
GET /api/stats/platform   → Stats Platform Owner
```

### Formulaire public
```
GET  /api/form/:slug        → Config du formulaire
POST /api/form/:slug/submit → Soumettre (crée le lead)
PUT  /api/form/:slug/config → Personnaliser
```

### Webhooks (pour Meta & TikTok)
```
GET  /api/webhooks/meta    → Vérification webhook Meta
POST /api/webhooks/meta    → Réception leads Facebook/Instagram
POST /api/webhooks/tiktok  → Réception leads TikTok
POST /api/webhooks/test    → Test manuel (sans Meta)
```

---

## 🧪 Tester la capture de leads

### Test webhook manuel (sans Meta)
Ouvrez Postman ou utilisez curl :
```bash
curl -X POST http://localhost:4000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "source": "FACEBOOK",
    "nom": "Test Lead",
    "tel": "0612345678",
    "email": "test@gmail.com",
    "formation": "TS Développement Info"
  }'
```

Le lead doit apparaître immédiatement dans le CRM.

### Test formulaire public
1. Ouvrez : http://localhost:5173/form/ecolea
2. Remplissez le formulaire
3. Soumettez
4. Connectez-vous au CRM → le lead est là !

---

## 🗂️ Structure du projet

```
nexcrm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    ← Structure base de données
│   │   └── seed.js          ← Données de test
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js      ← JWT + rôles
│   │   ├── routes/
│   │   │   ├── auth.js      ← Login, me
│   │   │   ├── leads.js     ← CRUD leads
│   │   │   ├── users.js     ← Gestion users
│   │   │   ├── stats.js     ← Dashboard stats
│   │   │   ├── companies.js ← Multi-tenant
│   │   │   ├── integrations.js ← Sources
│   │   │   ├── webhooks.js  ← Meta + TikTok
│   │   │   └── form.js      ← Formulaire public
│   │   └── index.js         ← Serveur Express
│   ├── .env                 ← Variables d'environnement
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UI.jsx       ← Design system (Button, Badge, Modal...)
    │   │   ├── Layout.jsx   ← Layout avec topbar
    │   │   └── Sidebar.jsx  ← Navigation par rôle
    │   ├── contexts/
    │   │   └── AuthContext.jsx ← Auth + rôles
    │   ├── pages/
    │   │   ├── Login.jsx    ← Page connexion
    │   │   ├── Dashboard.jsx ← KPIs + charts
    │   │   ├── Leads.jsx    ← CRUD prospects
    │   │   ├── Kanban.jsx   ← Pipeline drag & drop
    │   │   ├── PublicForm.jsx ← Formulaire public
    │   │   └── OtherPages.jsx ← Stats, Users, Settings, Integrations
    │   ├── services/
    │   │   └── api.js       ← Axios + tous les services
    │   ├── App.jsx          ← Routes + protection par rôle
    │   └── index.css        ← Thème light/dark
    └── package.json
```

---

## 🔐 Rôles et accès

| Fonctionnalité | Owner | Admin | Directeur | Commercial | Comptabilité |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tous les leads | ✅ | ✅ | ✅ (lecture) | ❌ | ❌ |
| Ses leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Créer/modifier leads | ✅ | ✅ | ❌ | ✅ | ❌ |
| Supprimer leads | ✅ | ✅ | ❌ | ❌ | ❌ |
| Pipeline Kanban | ✅ | ✅ | ❌ | ✅ | ❌ |
| Statistiques | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gestion utilisateurs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Finance & paiements | ✅ | ✅ | ✅ | ✅ | ✅ |
| Intégrations | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestion écoles (SaaS) | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## ❗ Résolution de problèmes

### Port déjà utilisé
```powershell
# Tuer le processus sur le port 4000
netstat -ano | findstr :4000
taskkill /PID [PID] /F
```

### Erreur Prisma
```powershell
cd backend
npx prisma db push --accept-data-loss
npx prisma generate
```

### Réinitialiser la base de données
```powershell
# Dans psql -U postgres
DROP DATABASE nexcrm_db;
CREATE DATABASE nexcrm_db OWNER nexcrm;
# Puis relancer le seed
```
