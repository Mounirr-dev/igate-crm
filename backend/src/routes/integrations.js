const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/integrations - liste des intégrations de la company
router.get("/", authenticate, requireRole("PLATFORM_OWNER","COMPANY_ADMIN"), async (req, res) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { companyId: req.user.companyId }
    });
    res.json(integrations);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/integrations - créer ou mettre à jour une intégration
router.post("/", authenticate, requireRole("PLATFORM_OWNER","COMPANY_ADMIN"), async (req, res) => {
  try {
    const { source, config } = req.body;
    if (!source) return res.status(400).json({ error: "Source requise" });

    const integration = await prisma.integration.upsert({
      where: { companyId_source: { companyId: req.user.companyId, source } },
      update: { config, actif: true },
      create: { companyId: req.user.companyId, source, config, actif: true }
    });
    res.json(integration);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/integrations/:source/toggle
router.patch("/:source/toggle", authenticate, requireRole("PLATFORM_OWNER","COMPANY_ADMIN"), async (req, res) => {
  try {
    const { source } = req.params;
    const existing = await prisma.integration.findUnique({
      where: { companyId_source: { companyId: req.user.companyId, source } }
    });

    if (!existing) {
      const created = await prisma.integration.create({
        data: { companyId: req.user.companyId, source, actif: true }
      });
      return res.json(created);
    }

    const updated = await prisma.integration.update({
      where: { id: existing.id },
      data: { actif: !existing.actif }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
