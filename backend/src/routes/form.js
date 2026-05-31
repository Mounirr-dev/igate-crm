const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/form/:slug - config du formulaire public
router.get("/:slug", async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug },
      include: { formConfig: true }
    });
    if (!company || company.statut === "SUSPENDU") {
      return res.status(404).json({ error: "Formulaire non trouvé" });
    }
    res.json({
      companyId: company.id,
      nom: company.nom,
      slug: company.slug,
      formConfig: company.formConfig || {
        titre: `Inscrivez-vous — ${company.nom}`,
        sousTitre: "Formations professionnelles 2026",
        description: "Notre équipe vous contactera dans les 24h",
        couleur: "#1a3a5c",
        formations: [
          "TS Développement Informatique",
          "TS Gestion des Entreprises",
          "TS Infirmier Polyvalent",
          "Technicien Aide Comptable",
          "Qualification Aide Soignant"
        ]
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/form/:slug/submit - soumission formulaire public
router.post("/:slug/submit", async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug }
    });
    if (!company) return res.status(404).json({ error: "Formulaire non trouvé" });

    const { nom, tel, email, ville, formation, niveau, message, source } = req.body;
    if (!nom || !tel || !formation) {
      return res.status(400).json({ error: "Nom, téléphone et formation requis" });
    }

    // Assignation auto
    const commerciaux = await prisma.user.findMany({
      where: { companyId: company.id, role: "COMMERCIAL", actif: true }
    });
    let userId = null;
    if (commerciaux.length > 0) {
      const lastLead = await prisma.lead.findFirst({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
        select: { userId: true }
      });
      const lastIdx = commerciaux.findIndex(c => c.id === lastLead?.userId);
      const nextIdx = (lastIdx + 1) % commerciaux.length;
      userId = commerciaux[nextIdx].id;
    }

    // Déterminer source depuis UTM
    const sourceMap = {
      facebook: "FACEBOOK", instagram: "INSTAGRAM",
      tiktok: "TIKTOK", site_web: "SITE_WEB",
      whatsapp: "WHATSAPP", qr_code: "QR_CODE"
    };
    const leadSource = sourceMap[source?.toLowerCase()] || "SITE_WEB";

    const lead = await prisma.lead.create({
      data: {
        companyId: company.id,
        userId,
        nom, tel,
        email: email || null,
        ville: ville || null,
        formation,
        statut: "NOUVEAU",
        source: leadSource,
        notes: message ? `Niveau: ${niveau || "N/A"} | Message: ${message}` : null
      }
    });

    // Incrémenter stats intégration site web
    await prisma.integration.updateMany({
      where: { companyId: company.id, source: "SITE_WEB" },
      data: { leadsCount: { increment: 1 } }
    }).catch(() => {});

    res.status(201).json({
      message: "Demande envoyée avec succès",
      leadId: lead.id,
      assignedTo: userId ? "commercial" : "non assigné"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/form/:slug/config - màj config formulaire
router.put("/:slug/config", async (req, res) => {
  try {
    const company = await prisma.company.findUnique({ where: { slug: req.params.slug } });
    if (!company) return res.status(404).json({ error: "Non trouvé" });

    const config = await prisma.formConfig.upsert({
      where: { companyId: company.id },
      update: req.body,
      create: { companyId: company.id, ...req.body }
    });
    res.json(config);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
