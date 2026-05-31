require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const leadsRoutes = require("./routes/leads");
const usersRoutes = require("./routes/users");
const statsRoutes = require("./routes/stats");
const companiesRoutes = require("./routes/companies");
const integrationsRoutes = require("./routes/integrations");
const webhookRoutes = require("./routes/webhooks");
const formRoutes = require("./routes/form");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => res.json({
  status: "ok",
  service: "NexCRM API",
  version: "1.0.0",
  env: process.env.NODE_ENV
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/form", formRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Route non trouvée" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Erreur:", err.stack);
  res.status(500).json({ error: "Erreur serveur interne", message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 NexCRM API démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`\n📋 Routes disponibles:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/leads`);
  console.log(`   POST /api/leads`);
  console.log(`   GET  /api/stats/dashboard`);
  console.log(`   POST /api/webhooks/meta`);
  console.log(`   POST /api/webhooks/tiktok`);
  console.log(`   GET  /api/form/:slug\n`);
});
