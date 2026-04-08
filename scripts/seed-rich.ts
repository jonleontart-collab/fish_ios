import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding rich mock data...");

  // Get users
  const alex = await prisma.user.findUnique({ where: { handle: "aleksandr" } });
  const marina = await prisma.user.findUnique({ where: { handle: "marina-spin" } });
  const ilya = await prisma.user.findUnique({ where: { handle: "ilya_night" } });
  const roman = await prisma.user.findUnique({ where: { handle: "roman_carp" } });

  if (!alex || !marina || !ilya || !roman) {
    console.error("Missing base users. Please run the default seed first.");
    return;
  }

  // Update Users with avatars and banners
  await prisma.user.update({
    where: { id: alex.id },
    data: {
      name: "Александр",
      bio: "Люблю спиннинг и джиг. Ищу новые точки каждые выходные.",
      city: "Москва",
      avatarPath: "/images/avatar-1.jpg",
      bannerPath: "/graphics/hero-main-river.png",
      experienceYears: 12,
      homeWater: "Иваньковское водохранилище",
    }
  });

  await prisma.user.update({
    where: { id: marina.id },
    data: {
      name: "Рыбачка Марина",
      bio: "Фидер, карп, природа. Ловлю ради процесса.",
      city: "Санкт-Петербург",
      avatarPath: "/images/vatar-2.jpg",
      bannerPath: "/graphics/place-clear-lake.png",
    }
  });

  await prisma.user.update({
    where: { id: ilya.id },
    data: {
      name: "Илья Night Predator",
      bio: "Ночной хищник. Судак, щука, только жесткий твич.",
      city: "Казань",
      avatarPath: "https://images.unsplash.com/photo-1510425463958-3079b76add66?w=800&q=80",
    }
  });

  // Get some places to associate catches
  const places = await prisma.place.findMany({ take: 3 });
  if (places.length === 0) {
     console.log("No places found to tie catches to.");
     return;
  }
  const place = places[0];

  // Delete old catches to avoid duplicates (optional, just to keep clean)
  await prisma.catchLike.deleteMany({});
  await prisma.catchComment.deleteMany({});
  await prisma.catch.deleteMany({});

  // CATCH 1: Ilya's huge Pike
  const catch1 = await prisma.catch.create({
    data: {
      userId: ilya.id,
      placeId: place.id,
      species: "Щука",
      weightKg: 6.5,
      lengthCm: 92,
      bait: "Воблер OSP Rudra 130",
      note: "Взяла на паузе, бой был жесткий! Еле вытащил из коряг.",
      imagePath: "/images/catch-1.jpg",
      recognizedSpecies: "Щука",
      aiConfidence: 96,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      likesCount: 24,
    }
  });

  // CATCH 2: Alexander's Zander
  const catch2 = await prisma.catch.create({
    data: {
      userId: alex.id,
      placeId: place.id,
      species: "Судак",
      weightKg: 3.2,
      lengthCm: 65,
      bait: "Силикон Keitech 4 дюйма",
      note: "Классический ночной джиг сработал на бровке в 6 метров.",
      imagePath: "/images/catch-2.jpg",
      recognizedSpecies: "Судак",
      aiConfidence: 85,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      likesCount: 15,
    }
  });

  // CATCH 3: Marina's Carp
  const catch3 = await prisma.catch.create({
    data: {
      userId: marina.id,
      placeId: place.id,
      species: "Карп",
      weightKg: 12.0,
      lengthCm: 80,
      bait: "Бойл Strawberry 14мм",
      note: "Мой личный рекорд! Ждала поклевку почти сутки.",
      imagePath: "/images/catch-3.jpg",
      recognizedSpecies: "Карп",
      aiConfidence: 92,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      likesCount: 42,
    }
  });

  // CATCH 4: Alexander's Perch
  await prisma.catch.create({
    data: {
      userId: alex.id,
      placeId: place.id,
      species: "Окунь",
      weightKg: 0.8,
      lengthCm: 35,
      bait: "Микроджиг 2г + полярис",
      note: "Спортивная ловля полосатого перед закатом.",
      imagePath: "/images/catch-4.jpg",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      likesCount: 8,
    }
  });

  // Add Comments
  await prisma.catchComment.createMany({
    data: [
      {
        catchId: catch1.id,
        userId: alex.id,
        body: "Монстр! Где взял, на русле?",
      },
      {
         catchId: catch1.id,
         userId: marina.id,
         body: "Ого, какая пасть страшная 😍",
      },
      {
        catchId: catch2.id,
        userId: ilya.id,
        body: "Хороший клыкастый. Какой цвет приманки сработал?",
      },
      {
        catchId: catch3.id,
        userId: alex.id,
        body: "Достойно уважения. Карпфишинг это искусство.",
      }
    ]
  });

  // Setup Friendships
  await prisma.userFriend.deleteMany({});
  await prisma.userFriend.createMany({
      data: [
         { userId: alex.id, friendId: marina.id, status: "ACCEPTED" },
         { userId: alex.id, friendId: ilya.id, status: "ACCEPTED" },
         { userId: marina.id, friendId: alex.id, status: "ACCEPTED" },
         { userId: ilya.id, friendId: alex.id, status: "ACCEPTED" },
      ]
  });

  console.log("Rich data seeded successfully! 🎣");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
