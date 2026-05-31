const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NexCRM database...\n");

  // ─── PLATFORM OWNER ───
  const ownerPass = await bcrypt.hash("owner123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@nexcrm.com" },
    update: {},
    create: {
      email: "owner@nexcrm.com",
      password: ownerPass,
      nom: "Kamal Idrissi",
      role: "PLATFORM_OWNER",
      companyId: null
    }
  });
  console.log("✅ Platform Owner créé:", owner.email);

  // ─── COMPANY A ───
  const companyA = await prisma.company.upsert({
    where: { slug: "ecolea" },
    update: {},
    create: {
      nom: "École Supérieure A",
      slug: "ecolea",
      email: "contact@ecolea.ma",
      tel: "+212 600 000 001",
      ville: "Casablanca",
      plan: "PRO",
      statut: "ACTIF"
    }
  });
  console.log("✅ Company A créée:", companyA.nom);

  // Users Company A
  const adminPass = await bcrypt.hash("admin123", 10);
  const adminA = await prisma.user.upsert({
    where: { email: "admin@ecolea.ma" },
    update: {},
    create: {
      companyId: companyA.id,
      email: "admin@ecolea.ma",
      password: adminPass,
      nom: "Sara Admin",
      role: "COMPANY_ADMIN"
    }
  });

  const dirPass = await bcrypt.hash("dir123", 10);
  await prisma.user.upsert({
    where: { email: "dir@ecolea.ma" },
    update: {},
    create: {
      companyId: companyA.id,
      email: "dir@ecolea.ma",
      password: dirPass,
      nom: "Ahmed Directeur",
      role: "DIRECTEUR"
    }
  });

  const comPass = await bcrypt.hash("crm123", 10);
  const com1 = await prisma.user.upsert({
    where: { email: "com@ecolea.ma" },
    update: {},
    create: {
      companyId: companyA.id,
      email: "com@ecolea.ma",
      password: comPass,
      nom: "Ahmed Salimi",
      role: "COMMERCIAL"
    }
  });

  const com2Pass = await bcrypt.hash("crm123", 10);
  const com2 = await prisma.user.upsert({
    where: { email: "com2@ecolea.ma" },
    update: {},
    create: {
      companyId: companyA.id,
      email: "com2@ecolea.ma",
      password: com2Pass,
      nom: "Fatima Lahrizi",
      role: "COMMERCIAL"
    }
  });

  const comptaPass = await bcrypt.hash("compta123", 10);
  await prisma.user.upsert({
    where: { email: "compta@ecolea.ma" },
    update: {},
    create: {
      companyId: companyA.id,
      email: "compta@ecolea.ma",
      password: comptaPass,
      nom: "Fatima Compta",
      role: "COMPTABILITE"
    }
  });

  console.log("✅ Users Company A créés");

  // Form Config Company A
  await prisma.formConfig.upsert({
    where: { companyId: companyA.id },
    update: {},
    create: {
      companyId: companyA.id,
      titre: "École Supérieure A",
      sousTitre: "Inscrivez-vous — Formations 2026",
      description: "Remplissez ce formulaire et notre équipe vous contacte dans les 24h",
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

  // Intégrations Company A
  await prisma.integration.upsert({
    where: { companyId_source: { companyId: companyA.id, source: "FACEBOOK" } },
    update: {},
    create: { companyId: companyA.id, source: "FACEBOOK", actif: true, leadsCount: 52, config: { page: "École A" } }
  });
  await prisma.integration.upsert({
    where: { companyId_source: { companyId: companyA.id, source: "INSTAGRAM" } },
    update: {},
    create: { companyId: companyA.id, source: "INSTAGRAM", actif: true, leadsCount: 28 }
  });
  await prisma.integration.upsert({
    where: { companyId_source: { companyId: companyA.id, source: "SITE_WEB" } },
    update: {},
    create: { companyId: companyA.id, source: "SITE_WEB", actif: true, leadsCount: 22 }
  });

  console.log("✅ Intégrations créées");

  // ─── LEADS DEMO ───
  const formations = [
    "TS Développement Informatique",
    "TS Gestion des Entreprises",
    "TS Infirmier Polyvalent",
    "Technicien Aide Comptable",
    "Qualification Aide Soignant"
  ];
  const sources = ["FACEBOOK","INSTAGRAM","SITE_WEB","QR_CODE","WHATSAPP"];
  const statuts = ["NOUVEAU","A_APPELER","CONTACTE","INTERESSE","RDV","PAIEMENT","INSCRIT","PERDU"];
  const noms = [
    "Karim Benali","Sara Mourad","Youssef Alaoui","Nadia Tazi","Mohamed Alami",
    "Houda Rachidi","Amine Chraibi","Meryem Filali","Hamza Idrissi","Zineb Fassi",
    "Rachid Ouali","Lamia Berrada","Omar Chraibi","Fatima Zidane","Hassan Alami",
    "Sanaa Bennis","Tariq Moussaoui","Imane Fassi","Khalid Tazi","Rania Alaoui"
  ];

  let leadCount = 0;
  for (let i = 0; i < noms.length; i++) {
    const existing = await prisma.lead.findFirst({
      where: { companyId: companyA.id, nom: noms[i] }
    });
    if (!existing) {
      await prisma.lead.create({
        data: {
          companyId: companyA.id,
          userId: i % 2 === 0 ? com1.id : com2.id,
          nom: noms[i],
          tel: "06" + String(10000000 + i * 12345678).slice(0, 8),
          email: noms[i].toLowerCase().replace(" ", ".") + "@gmail.com",
          formation: formations[i % formations.length],
          statut: statuts[i % statuts.length],
          source: sources[i % sources.length],
          notes: i % 3 === 0 ? "Prospect très intéressé" : null,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        }
      });
      leadCount++;
    }
  }
  console.log(`✅ ${leadCount} leads démo créés`);

  // ─── COMPANY B (pour démontrer le multi-tenant) ───
  const companyB = await prisma.company.upsert({
    where: { slug: "institutb" },
    update: {},
    create: {
      nom: "Institut Technique B",
      slug: "institutb",
      email: "contact@institutb.ma",
      plan: "BASIC",
      statut: "ACTIF"
    }
  });

  const adminBPass = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@institutb.ma" },
    update: {},
    create: {
      companyId: companyB.id,
      email: "admin@institutb.ma",
      password: adminBPass,
      nom: "Admin Institut B",
      role: "COMPANY_ADMIN"
    }
  });
  console.log("✅ Company B créée:", companyB.nom);

  console.log("\n🎉 Seed terminé !\n");
  console.log("═══════════════════════════════════════");
  console.log("📋 COMPTES DE CONNEXION :");
  console.log("═══════════════════════════════════════");
  console.log("👑 Platform Owner : owner@nexcrm.com / owner123");
  console.log("🏫 Company Admin  : admin@ecolea.ma / admin123");
  console.log("📊 Directeur      : dir@ecolea.ma / dir123");
  console.log("🤝 Commercial 1   : com@ecolea.ma / crm123");
  console.log("🤝 Commercial 2   : com2@ecolea.ma / crm123");
  console.log("💰 Comptabilité   : compta@ecolea.ma / compta123");
  console.log("═══════════════════════════════════════");
  console.log("🌐 Formulaire public : http://localhost:5173/form/ecolea");
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch(e => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
