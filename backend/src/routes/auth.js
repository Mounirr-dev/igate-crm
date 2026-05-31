const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });
    if (!user) return res.status(401).json({ error: "Identifiants incorrects" });
    if (!user.actif) return res.status(401).json({ error: "Compte désactivé" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Identifiants incorrects" });

    const token = jwt.sign(
      { id: user.id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        company: user.company ? {
          id: user.company.id,
          nom: user.company.nom,
          slug: user.company.slug,
          plan: user.company.plan
        } : null
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const u = req.user;
  res.json({
    id: u.id,
    nom: u.nom,
    email: u.email,
    role: u.role,
    companyId: u.companyId,
    company: u.company ? {
      id: u.company.id,
      nom: u.company.nom,
      slug: u.company.slug,
      plan: u.company.plan
    } : null
  });
});

// POST /api/auth/change-password
router.post("/change-password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Champs requis" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Mot de passe actuel incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
