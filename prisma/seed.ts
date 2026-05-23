import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:devpassword@localhost:5432/campaign_forge",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Demo master user
  const masterHash = await bcrypt.hash("password123", 12);
  const master = await prisma.user.upsert({
    where: { email: "master@demo.com" },
    update: {},
    create: {
      email: "master@demo.com",
      username: "dungeon_master",
      displayName: "El Gran Máster",
      passwordHash: masterHash,
    },
  });

  // Demo player user
  const playerHash = await bcrypt.hash("password123", 12);
  const player = await prisma.user.upsert({
    where: { email: "player@demo.com" },
    update: {},
    create: {
      email: "player@demo.com",
      username: "aventurero",
      displayName: "Sir Aventurero",
      passwordHash: playerHash,
    },
  });

  // Demo campaign
  const campaign = await prisma.campaign.upsert({
    where: { slug: "la-maldicion-de-strahd" },
    update: {},
    create: {
      name: "La Maldición de Strahd",
      slug: "la-maldicion-de-strahd",
      description: "Un viaje oscuro al brumoso reino de Barovia, donde el Conde Strahd von Zarovich gobierna con puño de hierro sobre sus atormentados súbditos.",
      theme: "HORROR",
      system: "DND5E",
      inviteCode: "STRAHD",
      masterId: master.id,
      status: "ACTIVE",
    },
  });

  // Add members
  await prisma.campaignMember.upsert({
    where: { campaignId_userId: { campaignId: campaign.id, userId: master.id } },
    update: {},
    create: { campaignId: campaign.id, userId: master.id, role: "MASTER" },
  });

  await prisma.campaignMember.upsert({
    where: { campaignId_userId: { campaignId: campaign.id, userId: player.id } },
    update: {},
    create: { campaignId: campaign.id, userId: player.id, role: "PLAYER" },
  });

  // Demo NPC
  await prisma.nPC.upsert({
    where: { id: "npc-strahd-001" },
    update: {},
    create: {
      id: "npc-strahd-001",
      campaignId: campaign.id,
      name: "Conde Strahd von Zarovich",
      race: "Vampiro (Humano transformado)",
      occupation: "Señor de Barovia",
      appearance: "Un hombre alto y pálido con rasgos afilados y ojos oscuros que reflejan siglos de soledad y poder. Viste siempre de negro y rojo.",
      personality: "Arrogante, manipulador y obsesionado con Tatyana. Trata a los aventureros como juguetes o amenazas según su estado de ánimo.",
      backstory: "Un poderoso guerrero que firmó un pacto con entidades oscuras para vivir eternamente, convirtiéndose en el primer vampiro al asesinar a su propio hermano.",
      isKnownToParty: true,
    },
  });

  // Demo quest
  await prisma.quest.upsert({
    where: { id: "quest-strahd-001" },
    update: {},
    create: {
      id: "quest-strahd-001",
      campaignId: campaign.id,
      name: "Destruir al Conde Strahd",
      description: "Los aventureros deben encontrar las tres reliquias sagradas para finalmente poder enfrentarse y destruir al Conde Strahd von Zarovich.",
      type: "MAIN",
      status: "ACTIVE",
    },
  });

  // Chat room
  await prisma.chatRoom.upsert({
    where: { id: "chat-strahd-001" },
    update: {},
    create: {
      id: "chat-strahd-001",
      campaignId: campaign.id,
      name: "General",
      type: "PUBLIC",
      description: "Canal general de la campaña",
    },
  });

  console.log("✅ Seed completed!");
  console.log("\nDemo accounts:");
  console.log("  Master: master@demo.com / password123");
  console.log("  Player: player@demo.com / password123");
  console.log("\nCampaign invite code: STRAHD");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
