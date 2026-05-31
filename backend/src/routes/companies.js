// companies.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireRole } = require("../middleware/auth");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authenticate, requireRole("PLATFORM_OWNER"), async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { _count: { select: { leads: true, users: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(companies);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticate, requireRole("PLATFORM_OWNER"), async (req, res) => {
  try {
    const { nom, slug, email, tel, ville, plan } = req.body;
    if (!nom || !slug || !email) return res.status(400).json({ error: "Nom, slug et email requis" });
    const company = await prisma.company.create({
      data: { nom, slug: slug.toLowerCase(), email, tel, ville, plan: plan || "BASIC" }
    });
    res.status(201).json(company);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id/statut", authenticate, requireRole("PLATFORM_OWNER"), async (req, res) => {
  try {
    const { statut } = req.body;
    const company = await prisma.company.update({
      where: { id: parseInt(req.params.id) },
      data: { statut }
    });
    res.json(company);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
