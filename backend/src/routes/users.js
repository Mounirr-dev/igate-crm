const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users
router.get("/", authenticate, requireRole("PLATFORM_OWNER","COMPANY_ADMIN"), async (req, res) => {
  try {
    const where = req.user.role === "PLATFORM_OWNER"
      ? {}
      : { companyId: req.user.companyId };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, nom: true, email: true, role: true, actif: true, createdAt: true,
        company: { select: { id: true, nom: true } },
        _count: { select: { leads: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
router.post("/", authenticate, requireRole("PLATFORM_OWNER","COMPANY_ADMIN"), async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;
    if (!nom || !email || !password) {
      return res.status(400).json({ error: "Nom, email et mot de passe requis" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        nom, email,
        password: hashed,
        role: role || "COMMERCIAL",
        companyId: req.user.role === "PLATFORM_OWNER" ? null : req.user.companyId
      },
      select: { id: true, nom: true, email: true, role: true, createdAt: true }
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete("/:id", authenticate, requireRole("PLATFORM_OWNER","COMPANY_ADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.id) return res.status(400).json({ error: "Impossible de supprimer votre compte" });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Vérifier appartenance à la même company
    if (req.user.role !== "PLATFORM_OWNER" && user.companyId !== req.user.companyId) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
