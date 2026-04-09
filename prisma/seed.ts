import { subDays, subHours } from "date-fns";
import { ChatVisibility, PrismaClient, ShoppingItemStatus, TripStatus } from "@prisma/client";

import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

const demoPasswordHash = hashPassword("demo123");

const users = [
  {
    id: "user-aleksandr",
    name: "Aleksandr",
    firstName: "Aleksandr",
    lastName: "Orlov",
    handle: "aleksandr",
    birthDate: new Date("1991-06-12"),
    preferredLanguage: "ru",
    bio: "Trips, reports, and local water updates.",
    city: "Belgrade",
    experienceYears: 7,
    preferredStyles: "Spinning|Boat|River",
    homeWater: "Danube and Sava",
    passwordHash: demoPasswordHash,
    avatarGradient: "from-[#69f0ae] via-[#4fd1c5] to-[#4c6fff]",
  },
  {
    id: "user-marina",
    name: "Marina",
    firstName: "Marina",
    lastName: "Kirilova",
    handle: "marina_spin",
    birthDate: new Date("1994-03-04"),
    preferredLanguage: "en",
    bio: "Calm sessions, precise notes, and feeder experiments.",
    city: "Novi Sad",
    experienceYears: 5,
    preferredStyles: "Feeder|Stillwater",
    homeWater: "Weekend lakes",
    passwordHash: demoPasswordHash,
    avatarGradient: "from-[#ffb86b] via-[#ff7a59] to-[#ff4d6d]",
  },
  {
    id: "user-ilya",
    name: "Ilya",
    firstName: "Ilya",
    lastName: "Sidorov",
    handle: "ilya_night",
    birthDate: new Date("1989-09-21"),
    preferredLanguage: "ru",
    bio: "Night jig, structure scans, and private crew chats.",
    city: "Belgrade",
    experienceYears: 9,
    preferredStyles: "Jig|Night|Predator",
    homeWater: "Rivers and channels",
    passwordHash: demoPasswordHash,
    avatarGradient: "from-[#87b8ff] via-[#4c8cff] to-[#1f4fff]",
  },
  {
    id: "user-roman",
    name: "Roman",
    firstName: "Roman",
    lastName: "Petrov",
    handle: "roman_carp",
    birthDate: new Date("1987-11-17"),
    preferredLanguage: "ru",
    bio: "Long carp sessions, gear planning, and paid-pond reports.",
    city: "Belgrade",
    experienceYears: 11,
    preferredStyles: "Carp|Long sessions|Bank fishing",
    homeWater: "Club lakes and paid ponds",
    passwordHash: demoPasswordHash,
    avatarGradient: "from-[#f7d070] via-[#f7a93b] to-[#d97706]",
  },
];

const places = [
  {
    id: "place-mika-alas",
    slug: "mika-alas",
    name: "Mika Alas Veliko Jezero",
    shortDescription: "Paid carp water with easy bank access and stable morning bite windows.",
    description: "A structured carp lake close to the city with parking, shelters, and enough room for long sessions.",
    type: "PAYED" as const,
    city: "Belgrade",
    region: "Cukarica",
    latitude: 44.7578,
    longitude: 20.3546,
    rating: 4.8,
    distanceKm: 4,
    depthMeters: 3.5,
    fishSpecies: "Карп|Карась|Белый амур",
    amenities: "Парковка|Навесы|Мангал|Кафе",
    bestMonths: "Апрель|Май|Октябрь",
    coverImage: "https://images.unsplash.com/photo-1544335446-4cb7dfba852b?w=1200&q=80",
    source: "USER" as const,
    createdByUserId: "user-roman",
  },
  {
    id: "place-sava-mouth",
    slug: "sava-river-mouth",
    name: "Sava River Mouth",
    shortDescription: "Wild urban edge with drop-offs, current seams, and strong evening predator windows.",
    description: "A classic river session spot for jig and shore casting, especially around dusk and after stable pressure.",
    type: "WILD" as const,
    city: "Belgrade",
    region: "Dorcol",
    latitude: 44.8258,
    longitude: 20.4455,
    rating: 4.5,
    distanceKm: 2,
    depthMeters: 6,
    fishSpecies: "Судак|Окунь|Сом",
    amenities: "Парковка|Причал|Съезд к воде",
    bestMonths: "Сентябрь|Октябрь|Ноябрь",
    coverImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80",
    source: "USER" as const,
    createdByUserId: "user-ilya",
  },
  {
    id: "place-silver-reeds",
    slug: "silver-reeds-lake",
    name: "Silver Reeds Lake",
    shortDescription: "Quiet club lake for feeder sessions, family weekends, and clear photo reports.",
    description: "A calmer water with predictable white-fish activity, neat bank positions, and room for day sessions.",
    type: "CLUB" as const,
    city: "Novi Sad",
    region: "Backa",
    latitude: 45.2563,
    longitude: 19.8086,
    rating: 4.6,
    distanceKm: 8,
    depthMeters: 2.8,
    fishSpecies: "Карп|Карась|Лещ",
    amenities: "Парковка|Пирс|Туалет|Палатки",
    bestMonths: "Май|Июнь|Сентябрь",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    source: "USER" as const,
    createdByUserId: "user-marina",
  },
];

async function upsertById<T extends { id: string }>(
  items: T[],
  upsert: (item: T) => Promise<unknown>,
) {
  for (const item of items) {
    await upsert(item);
  }
}

async function main() {
  await upsertById(users, (user) =>
    prisma.user.upsert({
      where: { id: user.id },
      create: user,
      update: user,
    }),
  );

  await upsertById(places, (place) =>
    prisma.place.upsert({
      where: { id: place.id },
      create: place,
      update: place,
    }),
  );

  await upsertById(
    [
      {
        id: "photo-mika-1",
        placeId: "place-mika-alas",
        userId: "user-roman",
        imagePath: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=1200&q=80",
        caption: "Morning light over the paid pond.",
      },
      {
        id: "photo-sava-1",
        placeId: "place-sava-mouth",
        userId: "user-ilya",
        imagePath: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80",
        caption: "Evening current line before the jig session.",
      },
      {
        id: "photo-silver-1",
        placeId: "place-silver-reeds",
        userId: "user-marina",
        imagePath: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
        caption: "Calm water and reeds near the feeder bank.",
      },
    ],
    (photo) =>
      prisma.placePhoto.upsert({
        where: { id: photo.id },
        create: photo,
        update: photo,
      }),
  );

  await upsertById(
    [
      {
        id: "trip-aleksandr-river",
        userId: "user-aleksandr",
        placeId: "place-sava-mouth",
        title: "Evening jig on the river edge",
        notes: "Check two drop-offs before sunset and keep the boat on the slower seam.",
        goals: "Find active zander on the first ledge.",
        summary: null,
        reportImagePath: null,
        startAt: subDays(new Date(), -2),
        endAt: null,
        status: TripStatus.CONFIRMED,
        publishedAt: null,
      },
      {
        id: "trip-marina-club",
        userId: "user-marina",
        placeId: "place-silver-reeds",
        title: "Feeder day at Silver Reeds",
        notes: "Take two feeder setups and test sweet corn on the deeper edge.",
        goals: "Build a calm day report with photos.",
        summary: "Steady white-fish bites through the middle of the day and one better carp close to the reeds.",
        reportImagePath: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80",
        startAt: subDays(new Date(), 2),
        endAt: subDays(new Date(), 2),
        status: TripStatus.COMPLETED,
        publishedAt: subDays(new Date(), 1),
      },
      {
        id: "trip-roman-carp",
        userId: "user-roman",
        placeId: "place-mika-alas",
        title: "Weekend carp opener",
        notes: "Two rods, one sweet bait line, one fishmeal line. Bring larger landing mat.",
        goals: "Test the warmer shallow bank at dawn.",
        summary: null,
        reportImagePath: null,
        startAt: subDays(new Date(), -5),
        endAt: null,
        status: TripStatus.PLANNED,
        publishedAt: null,
      },
    ],
    (trip) =>
      prisma.trip.upsert({
        where: { id: trip.id },
        create: trip,
        update: trip,
      }),
  );

  await upsertById(
    [
      {
        id: "inventory-rod",
        userId: "user-aleksandr",
        name: "River spinning rod 2.4 m",
        category: "Rods",
        quantity: 1,
        notes: "Fast action for shore jig work.",
      },
      {
        id: "inventory-reel",
        userId: "user-aleksandr",
        name: "3000 reel",
        category: "Reels",
        quantity: 1,
        notes: "Main reel for daily river sessions.",
      },
      {
        id: "inventory-feeder",
        userId: "user-marina",
        name: "Medium feeder setup",
        category: "Feeder",
        quantity: 2,
        notes: "One soft tip and one spare.",
      },
    ],
    (item) =>
      prisma.inventoryItem.upsert({
        where: { id: item.id },
        create: item,
        update: item,
      }),
  );

  await upsertById(
    [
      {
        id: "shopping-leader",
        userId: "user-aleksandr",
        tripId: "trip-aleksandr-river",
        title: "Fluorocarbon leader",
        notes: "0.4 mm for river predators.",
        quantity: 2,
        status: ShoppingItemStatus.PLANNED,
      },
      {
        id: "shopping-bait",
        userId: "user-roman",
        tripId: "trip-roman-carp",
        title: "Sweet corn boilies",
        notes: "Two bright packs for the warmer bank.",
        quantity: 2,
        status: ShoppingItemStatus.PLANNED,
      },
      {
        id: "shopping-hooks",
        userId: "user-marina",
        tripId: "trip-marina-club",
        title: "Fine feeder hooks",
        notes: "Already bought for the next club session.",
        quantity: 1,
        status: ShoppingItemStatus.BOUGHT,
      },
    ],
    (item) =>
      prisma.shoppingItem.upsert({
        where: { id: item.id },
        create: item,
        update: item,
      }),
  );

  await upsertById(
    [
      {
        id: "catch-carp-1",
        userId: "user-roman",
        placeId: "place-mika-alas",
        species: "Карп",
        weightKg: 12.5,
        lengthCm: 85,
        bait: "Бойлы клубника",
        note: "Strong run after midnight and a clean landing at the net.",
        imagePath: "https://images.unsplash.com/photo-1555529452-f47053e1a067?w=1200&q=80",
        recognizedSpecies: "Карп",
        aiConfidence: 98,
        likesCount: 24,
        isFeatured: true,
        createdAt: subHours(new Date(), 24),
      },
      {
        id: "catch-zander-1",
        userId: "user-ilya",
        placeId: "place-sava-mouth",
        species: "Судак",
        weightKg: 4.2,
        lengthCm: 68,
        bait: "Силикон 4 дюйма",
        note: "Classic river edge bite on the pause close to the ledge.",
        imagePath: "https://images.unsplash.com/photo-1536486161986-77e8fd0117ff?w=1200&q=80",
        recognizedSpecies: "Судак",
        aiConfidence: 95,
        likesCount: 15,
        isFeatured: false,
        createdAt: subHours(new Date(), 12),
      },
      {
        id: "catch-bream-1",
        userId: "user-marina",
        placeId: "place-silver-reeds",
        species: "Лещ",
        weightKg: 1.6,
        lengthCm: 44,
        bait: "Кукуруза",
        note: "Clean feeder session with a steady daytime rhythm.",
        imagePath: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
        recognizedSpecies: "Лещ",
        aiConfidence: 91,
        likesCount: 9,
        isFeatured: false,
        createdAt: subHours(new Date(), 8),
      },
    ],
    (catchItem) =>
      prisma.catch.upsert({
        where: { id: catchItem.id },
        create: catchItem,
        update: catchItem,
      }),
  );

  await upsertById(
    [
      {
        id: "chat-nearby",
        slug: "nearby-waters",
        ownerId: "user-aleksandr",
        title: "Nearby Waters",
        description: "Quick local updates before you leave home.",
        accentColor: "#69f0ae",
        visibility: ChatVisibility.OPEN,
      },
      {
        id: "chat-night",
        slug: "night-predator",
        ownerId: "user-ilya",
        title: "Night Predator",
        description: "Private thread for night jig plans and structure notes.",
        accentColor: "#87b8ff",
        visibility: ChatVisibility.PRIVATE,
      },
      {
        id: "chat-gear",
        slug: "gear-room",
        ownerId: "user-marina",
        title: "Gear Room",
        description: "Tackle, shopping lists, and setup discussions.",
        accentColor: "#f7d070",
        visibility: ChatVisibility.OPEN,
      },
    ],
    (chat) =>
      prisma.chat.upsert({
        where: { id: chat.id },
        create: chat,
        update: chat,
      }),
  );

  await upsertById(
    [
      { id: "member-nearby-a", chatId: "chat-nearby", userId: "user-aleksandr" },
      { id: "member-nearby-m", chatId: "chat-nearby", userId: "user-marina" },
      { id: "member-nearby-r", chatId: "chat-nearby", userId: "user-roman" },
      { id: "member-night-a", chatId: "chat-night", userId: "user-aleksandr" },
      { id: "member-night-i", chatId: "chat-night", userId: "user-ilya" },
      { id: "member-gear-a", chatId: "chat-gear", userId: "user-aleksandr" },
      { id: "member-gear-m", chatId: "chat-gear", userId: "user-marina" },
      { id: "member-gear-r", chatId: "chat-gear", userId: "user-roman" },
    ],
    (member) =>
      prisma.chatMember.upsert({
        where: { id: member.id },
        create: member,
        update: member,
      }),
  );

  await upsertById(
    [
      {
        id: "message-1",
        chatId: "chat-nearby",
        userId: "user-marina",
        body: "Pressure is steady. Looks like a clean morning window if the wind stays low.",
        createdAt: subHours(new Date(), 3),
      },
      {
        id: "message-2",
        chatId: "chat-nearby",
        userId: "user-aleksandr",
        body: "I am packing now. If the river edge is active, I will post it to the map.",
        createdAt: subHours(new Date(), 2),
      },
      {
        id: "message-3",
        chatId: "chat-night",
        userId: "user-ilya",
        body: "Check the deeper edge after sunset. The jig bite turned on late yesterday.",
        createdAt: subHours(new Date(), 4),
      },
    ],
    (message) =>
      prisma.message.upsert({
        where: { id: message.id },
        create: message,
        update: message,
      }),
  );

  await upsertById(
    [
      { id: "friend-a-m", userId: "user-aleksandr", friendId: "user-marina", status: "ACCEPTED" },
      { id: "friend-m-a", userId: "user-marina", friendId: "user-aleksandr", status: "ACCEPTED" },
      { id: "friend-a-i", userId: "user-aleksandr", friendId: "user-ilya", status: "ACCEPTED" },
      { id: "friend-i-a", userId: "user-ilya", friendId: "user-aleksandr", status: "ACCEPTED" },
    ],
    (friend) =>
      prisma.userFriend.upsert({
        where: { id: friend.id },
        create: friend,
        update: friend,
      }),
  );

  await upsertById(
    [
      { id: "like-1", catchId: "catch-carp-1", userId: "user-aleksandr" },
      { id: "like-2", catchId: "catch-zander-1", userId: "user-marina" },
    ],
    (item) =>
      prisma.catchLike.upsert({
        where: { id: item.id },
        create: item,
        update: item,
      }),
  );

  await upsertById(
    [
      {
        id: "comment-1",
        catchId: "catch-carp-1",
        userId: "user-marina",
        body: "Perfect mirror and clean night report.",
      },
      {
        id: "comment-2",
        catchId: "catch-zander-1",
        userId: "user-aleksandr",
        body: "That ledge keeps producing at dusk.",
      },
    ],
    (item) =>
      prisma.catchComment.upsert({
        where: { id: item.id },
        create: item,
        update: item,
      }),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
