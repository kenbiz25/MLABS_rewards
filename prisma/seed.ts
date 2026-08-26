import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUsers() {
  // Everyone authenticates via Microsoft sign-in (see
  // app/api/auth/microsoft/callback/route.ts) - there's no password to seed.
  // This just pre-provisions the admin's email with isAdmin: true so their
  // first Microsoft sign-in lands on the admin dashboard.
  const adminEmail = (process.env.ADMIN_EMAIL ?? "catherine.muthoni@medtroniclabs.org").toLowerCase();

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true, name: "Catherine Muthoni" },
    create: { name: "Catherine Muthoni", email: adminEmail, isAdmin: true },
  });
  console.log(`Seeded admin user: ${adminEmail} (signs in with Microsoft)`);
}

async function main() {
  await seedUsers();

  await prisma.cycleWinner.deleteMany();
  await prisma.nomination.deleteMany();
  await prisma.cycle.deleteMany();

  console.log("No demo cycles or nominations seeded — clean production database.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
