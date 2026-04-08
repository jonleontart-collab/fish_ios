import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database for production...");
  
  // Wipe all data
  await prisma.catchComment.deleteMany();
  await prisma.catchLike.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatMember.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.catch.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating Admin User...");

  const admin = await prisma.user.create({
    data: {
      handle: "alexander-admin",
      name: "Александр",
      bio: "Creator of FishFlow",
      city: "Moscow",
      avatarGradient: "from-blue-500 to-cyan-400",
      avatarPath: "/images/avatar-1.jpg",
      bannerPath: "/graphics/hero-main-river.png",
      experienceYears: 12,
      homeWater: "Иваньковское водохранилище",
    }
  });

  console.log(`Production DB ready! Admin ID: ${admin.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
