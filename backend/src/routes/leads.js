const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Helper: filtre par company + rôle
function getLeadFilter(user) {
  const base = { companyId: user.companyId };
  if (user.role === "COMMERCIAL") {
    base.userId = user.id; // commercial voit seulement ses leads
  }
  return base;
}

// GET /api/leads
router.get("/", authenticate, async (req, res) => {
  try {
    const { search, statut, source, userId, page = 1, limit = 50 } = req.query;
    const where = getLeadFilter(req.user);

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { tel: { contains: search } }
      ];
    }
    if (statut) where.statut = statut;
    if (source) where.source = source;
    if (userId && req.user.role !== "COMMERCIAL") where.userId = parseInt(userId);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          conseiller: { select: { id: true, nom: true, email: true } },
          activites: { orderBy: { date: "desc" }, take: 3 }
        },
        orderBy: { createdAt: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.lead.count({ where })
    ]);

    res.json({ data: leads, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id), companyId: req.user.companyId },
      include: {
        conseiller: { select: { id: true, nom: true, email: true } },
        activites: {
          include: { user: { select: { id: true, nom: true } } },
          orderBy: { date: "desc" }
        }
      }
    });
    if (!lead) return res.status(404).json({ error: "Lead non trouvé" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads
router.post("/", authenticate, async (req, res) => {
  if (req.user.role === "DIRECTEUR" || req.user.role === "COMPTABILITE") {
    return res.status(403).json({ error: "Accès non autorisé" });
  }
  try {
    const { nom, tel, email, ville, formation, statut, source, notes, userId } = req.body;
    if (!nom || !tel || !formation) {
      return res.status(400).json({ error: "Nom, téléphone et formation requis" });
    }

    // Assignation automatique Round Robin si pas de userId
    let assignedUserId = userId || req.user.id;
    if (!userId && req.user.role !== "COMMERCIAL") {
      const commerciaux = await prisma.user.findMany({
        where: { companyId: req.user.companyId, role: "COMMERCIAL", actif: true }
      });
      if (commerciaux.length > 0) {
        const lastLead = await prisma.lead.findFirst({
          where: { companyId: req.user.companyId },
          orderBy: { createdAt: "desc" },
          select: { userId: true }
        });
        const lastIdx = commerciaux.findIndex(c => c.id === lastLead?.userId);
        const nextIdx = (lastIdx + 1) % commerciaux.length;
        assignedUserId = commerciaux[nextIdx].id;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        companyId: req.user.companyId,
        userId: assignedUserId,
        nom, tel,
        email: email || null,
        ville: ville || null,
        formation,
        statut: statut || "NOUVEAU",
        source: source || "SITE_WEB",
        notes: notes || null
      },
      include: {
        conseiller: { select: { id: true, nom: true } }
      }
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/leads/:id
router.put("/:id", authenticate, async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id), companyId: req.user.companyId }
    });
    if (!lead) return res.status(404).json({ error: "Lead non trouvé" });
    if (req.user.role === "DIRECTEUR") return res.status(403).json({ error: "Lecture seule" });

    const { nom, tel, email, ville, formation, statut, source, notes, userId } = req.body;
    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        nom: nom || lead.nom,
        tel: tel || lead.tel,
        email: email !== undefined ? email : lead.email,
        ville: ville !== undefined ? ville : lead.ville,
        formation: formation || lead.formation,
        statut: statut || lead.statut,
        source: source || lead.source,
        notes: notes !== undefined ? notes : lead.notes,
        userId: userId !== undefined ? userId : lead.userId
      },
      include: { conseiller: { select: { id: true, nom: true } } }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id/statut
router.patch("/:id/statut", authenticate, async (req, res) => {
  try {
    const { statut } = req.body;
    if (!statut) return res.status(400).json({ error: "Statut requis" });
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id), companyId: req.user.companyId }
    });
    if (!lead) return res.status(404).json({ error: "Lead non trouvé" });

    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: { statut }
    });

    // Log activité
    await prisma.activite.create({
      data: {
        leadId: lead.id,
        userId: req.user.id,
        type: "note",
        contenu: `Statut changé → ${statut}`
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role === "COMMERCIAL" || req.user.role === "DIRECTEUR") {
      return res.status(403).json({ error: "Non autorisé" });
    }
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id), companyId: req.user.companyId }
    });
    if (!lead) return res.status(404).json({ error: "Lead non trouvé" });
    await prisma.lead.delete({ where: { id: lead.id } });
    res.json({ message: "Lead supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/activites
router.post("/:id/activites", authenticate, async (req, res) => {
  try {
    const { type, contenu } = req.body;
    if (!type || !contenu) return res.status(400).json({ error: "Type et contenu requis" });
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id), companyId: req.user.companyId }
    });
    if (!lead) return res.status(404).json({ error: "Lead non trouvé" });

    const activite = await prisma.activite.create({
      data: { leadId: lead.id, userId: req.user.id, type, contenu },
      include: { user: { select: { id: true, nom: true } } }
    });
    res.status(201).json(activite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
