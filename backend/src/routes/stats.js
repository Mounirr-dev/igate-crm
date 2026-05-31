const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/stats/dashboard
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const baseWhere = req.user.role === "COMMERCIAL"
      ? { companyId, userId: req.user.id }
      : { companyId };

    const [total, parStatut, parSource, recent, tendance] = await Promise.all([
      prisma.lead.count({ where: baseWhere }),

      prisma.lead.groupBy({
        by: ["statut"],
        where: baseWhere,
        _count: { statut: true }
      }),

      prisma.lead.groupBy({
        by: ["source"],
        where: baseWhere,
        _count: { source: true },
        orderBy: { _count: { source: "desc" } }
      }),

      prisma.lead.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { conseiller: { select: { id: true, nom: true } } }
      }),

      // Tendance 6 mois
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YY') as mois,
          COUNT(*)::int as count
        FROM leads
        WHERE "companyId" = ${companyId}
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `
    ]);

    // Stats commerciaux (pour admin/directeur)
    let commerciaux = [];
    if (req.user.role !== "COMMERCIAL") {
      commerciaux = await prisma.user.findMany({
        where: { companyId, role: "COMMERCIAL" },
        select: {
          id: true, nom: true,
          _count: { select: { leads: true } }
        }
      });
    }

    res.json({
      total,
      parStatut: parStatut.map(s => ({ statut: s.statut, count: s._count.statut })),
      parSource: parSource.map(s => ({ source: s.source, count: s._count.source })),
      recent,
      tendanceMensuelle: tendance,
      commerciaux
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/platform (Platform Owner seulement)
router.get("/platform", authenticate, async (req, res) => {
  if (req.user.role !== "PLATFORM_OWNER") {
    return res.status(403).json({ error: "Accès réservé au Platform Owner" });
  }
  try {
    const [totalCompanies, totalLeads, companies] = await Promise.all([
      prisma.company.count(),
      prisma.lead.count(),
      prisma.company.findMany({
        include: {
          _count: { select: { leads: true, users: true } }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    res.json({ totalCompanies, totalLeads, companies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
