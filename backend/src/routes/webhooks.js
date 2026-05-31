const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Helper: assignation Round Robin
async function assignCommercial(companyId) {
  const commerciaux = await prisma.user.findMany({
    where: { companyId, role: "COMMERCIAL", actif: true },
    orderBy: { id: "asc" }
  });
  if (!commerciaux.length) return null;

  const lastLead = await prisma.lead.findFirst({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    select: { userId: true }
  });

  const lastIdx = commerciaux.findIndex(c => c.id === lastLead?.userId);
  const nextIdx = (lastIdx + 1) % commerciaux.length;
  return commerciaux[nextIdx].id;
}

// Helper: créer lead depuis webhook
async function createLeadFromWebhook(companyId, data, source) {
  const userId = await assignCommercial(companyId);
  return prisma.lead.create({
    data: {
      companyId,
      userId,
      nom: data.nom || data.full_name || "Inconnu",
      tel: data.tel || data.phone_number || "",
      email: data.email || null,
      ville: data.ville || data.city || null,
      formation: data.formation || data.interest || "Non précisé",
      statut: "NOUVEAU",
      source,
      notes: `Lead automatique via ${source}`
    }
  });
}

// ─── META (Facebook + Instagram) ───
// GET - Vérification webhook Meta
router.get("/meta", (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "nexcrm_verify_2026";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Meta Webhook vérifié");
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: "Token invalide" });
});

// POST - Réception leads Meta
router.post("/meta", async (req, res) => {
  try {
    const body = req.body;
    console.log("📥 Webhook Meta reçu:", JSON.stringify(body, null, 2));

    if (body.object === "page") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "leadgen") {
            const leadData = change.value;
            const pageId = entry.id;

            // Trouver la company par page_id dans les intégrations
            const integration = await prisma.integration.findFirst({
              where: {
                source: { in: ["FACEBOOK", "INSTAGRAM"] },
                actif: true,
                config: { path: ["page_id"], equals: pageId }
              }
            });

            if (!integration) {
              console.log("⚠️ Aucune company trouvée pour page_id:", pageId);
              continue;
            }

            // Parser les champs du formulaire Meta
            const fields = {};
            for (const f of leadData.field_data || []) {
              fields[f.name] = f.values?.[0] || "";
            }

            const lead = await createLeadFromWebhook(
              integration.companyId,
              {
                nom: fields.full_name || fields.first_name + " " + fields.last_name,
                tel: fields.phone_number || fields.phone,
                email: fields.email,
                formation: fields.formation || fields.interest || "Non précisé",
                ville: fields.city || fields.ville
              },
              leadData.ad_name?.includes("instagram") ? "INSTAGRAM" : "FACEBOOK"
            );

            // Incrémenter compteur intégration
            await prisma.integration.update({
              where: { id: integration.id },
              data: { leadsCount: { increment: 1 } }
            });

            console.log("✅ Lead Meta créé:", lead.nom, lead.tel);
          }
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Erreur webhook Meta:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── TIKTOK ───
router.post("/tiktok", async (req, res) => {
  try {
    const body = req.body;
    console.log("📥 Webhook TikTok reçu:", JSON.stringify(body, null, 2));

    const advertiserID = body.advertiser_id;
    const integration = await prisma.integration.findFirst({
      where: {
        source: "TIKTOK",
        actif: true,
        config: { path: ["advertiser_id"], equals: advertiserID }
      }
    });

    if (!integration) {
      console.log("⚠️ Aucune company TikTok pour advertiser_id:", advertiserID);
      return res.status(200).json({ status: "ignored" });
    }

    const leadInfo = body.lead_info || {};
    const lead = await createLeadFromWebhook(
      integration.companyId,
      {
        nom: leadInfo.name || "Inconnu",
        tel: leadInfo.phone || "",
        email: leadInfo.email,
        formation: leadInfo.interest || "Non précisé"
      },
      "TIKTOK"
    );

    await prisma.integration.update({
      where: { id: integration.id },
      data: { leadsCount: { increment: 1 } }
    });

    console.log("✅ Lead TikTok créé:", lead.nom);
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Erreur webhook TikTok:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── TEST MANUEL (pour tester sans Meta) ───
router.post("/test", async (req, res) => {
  try {
    const { companyId, source, nom, tel, email, formation } = req.body;
    if (!companyId || !nom || !tel) {
      return res.status(400).json({ error: "companyId, nom et tel requis" });
    }

    const lead = await createLeadFromWebhook(
      parseInt(companyId),
      { nom, tel, email, formation: formation || "Test" },
      source || "SITE_WEB"
    );

    res.status(201).json({ message: "Lead test créé", lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
