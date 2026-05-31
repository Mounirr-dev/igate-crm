const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });
    if (!user || !user.actif) return res.status(401).json({ error: "Utilisateur inactif" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Accès non autorisé pour ce rôle" });
  }
  next();
};

const requireCompany = (req, res, next) => {
  if (!req.user.companyId) {
    return res.status(403).json({ error: "Pas d'entreprise associée" });
  }
  next();
};

module.exports = { authenticate, requireRole, requireCompany };
