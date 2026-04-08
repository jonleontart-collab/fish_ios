import { subHours } from "date-fns";
import { ChatVisibility, PrismaClient, ShoppingItemStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.chatMember.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.catchLike.deleteMany();
  await prisma.catchComment.deleteMany();
  await prisma.placePhoto.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.catch.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: "user-aleksandr",
        name: "Aleksandr",
        handle: "aleksandr",
        bio: "Trips, reports, and local water updates.",
        experienceYears: 7,
        preferredStyles: "Spinning|Boat|River",
        homeWater: "Moves between new waters",
        avatarGradient: "from-[#69f0ae] via-[#4fd1c5] to-[#4c6fff]",
      },
      {
        id: "user-marina",
        name: "Marina",
        handle: "marina-spin",
        bio: "Calm sessions, precise notes, and feeder experiments.",
        experienceYears: 5,
        preferredStyles: "Feeder|Stillwater",
        homeWater: "Travels for weekend sessions",
        avatarGradient: "from-[#ffb86b] via-[#ff7a59] to-[#ff4d6d]",
      },
      {
        id: "user-ilya",
        name: "Ilya",
        handle: "ilya_night",
        bio: "Night jig, structure scans, and private crew chats.",
        experienceYears: 9,
        preferredStyles: "Jig|Night|Predator",
        homeWater: "Rivers and channels",
        avatarGradient: "from-[#87b8ff] via-[#4c8cff] to-[#1f4fff]",
      },
      {
        id: "user-roman",
        name: "Roman",
        handle: "roman_carp",
        bio: "Long carp sessions and gear planning.",
        experienceYears: 11,
        preferredStyles: "Carp|Long sessions|Bank fishing",
        homeWater: "Club lakes and paid ponds",
        avatarGradient: "from-[#f7d070] via-[#f7a93b] to-[#d97706]",
      },
    ],
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        id: "inventory-rod",
        userId: "user-aleksandr",
        name: "Spinning rod 2.4 m",
        category: "Rods",
        quantity: 1,
        notes: "Fast action for river work.",
      },
      {
        id: "inventory-reel",
        userId: "user-aleksandr",
        name: "3000 reel",
        category: "Reels",
        quantity: 1,
        notes: "Main reel for daily sessions.",
      },
      {
        id: "inventory-net",
        userId: "user-aleksandr",
        name: "Landing net",
        category: "Accessories",
        quantity: 1,
        notes: "Foldable frame.",
      },
    ],
  });

  await prisma.shoppingItem.createMany({
    data: [
      {
        id: "shopping-leader",
        userId: "user-aleksandr",
        title: "Fluorocarbon leader",
        notes: "0.4 mm for pike sessions.",
        quantity: 2,
        status: ShoppingItemStatus.PLANNED,
      },
      {
        id: "shopping-jigs",
        userId: "user-aleksandr",
        title: "Soft shad pack",
        notes: "Natural silver and dark olive.",
        quantity: 3,
        status: ShoppingItemStatus.PLANNED,
      },
      {
        id: "shopping-hooks",
        userId: "user-aleksandr",
        title: "Offset hooks",
        notes: "Already bought for next trip.",
        quantity: 1,
        status: ShoppingItemStatus.BOUGHT,
      },
    ],
  });

  await prisma.chat.createMany({
    data: [
      {
        id: "chat-nearby",
        slug: "nearby-waters",
        ownerId: "user-aleksandr",
        title: "Nearby Waters",
        description: "Quick local updates before you leave home.",
        accentColor: "#69f0ae",
        visibility: ChatVisibility.OPEN,
        updatedAt: subHours(new Date(), 1),
      },
      {
        id: "chat-night",
        slug: "night-predator",
        ownerId: "user-ilya",
        title: "Night Predator",
        description: "Private thread for night jig plans and structure notes.",
        accentColor: "#87b8ff",
        visibility: ChatVisibility.PRIVATE,
        updatedAt: subHours(new Date(), 3),
      },
      {
        id: "chat-gear",
        slug: "gear-room",
        ownerId: "user-marina",
        title: "Gear Room",
        description: "Tackle, shopping lists, and setup discussions.",
        accentColor: "#f7d070",
        visibility: ChatVisibility.OPEN,
        updatedAt: subHours(new Date(), 5),
      },
    ],
  });

  await prisma.chatMember.createMany({
    data: [
      { chatId: "chat-nearby", userId: "user-aleksandr" },
      { chatId: "chat-nearby", userId: "user-marina" },
      { chatId: "chat-nearby", userId: "user-roman" },
      { chatId: "chat-night", userId: "user-aleksandr" },
      { chatId: "chat-night", userId: "user-ilya" },
      { chatId: "chat-gear", userId: "user-aleksandr" },
      { chatId: "chat-gear", userId: "user-marina" },
      { chatId: "chat-gear", userId: "user-roman" },
    ],
  });

  await prisma.message.createMany({
    data: [
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
        body: "I am packing now. If the spot is active, I will post it to the map.",
        createdAt: subHours(new Date(), 2),
      },
      {
        id: "message-3",
        chatId: "chat-night",
        userId: "user-ilya",
        body: "Check the deeper edge after sunset. The jig bite turned on late yesterday.",
        createdAt: subHours(new Date(), 4),
      },
      {
        id: "message-4",
        chatId: "chat-gear",
        userId: "user-roman",
        body: "Who has a good compact chair for long bank sessions?",
        createdAt: subHours(new Date(), 6),
      },
      {
        id: "message-5",
        chatId: "chat-gear",
        userId: "user-marina",
        body: "Add leaders and hooks to the planner before the weekend. Easy to forget both.",
        createdAt: subHours(new Date(), 5),
      },
    ],
  });
  await prisma.userFriend.createMany({
    data: [
      { userId: "user-aleksandr", friendId: "user-marina", status: "ACCEPTED" },
      { userId: "user-marina", friendId: "user-aleksandr", status: "ACCEPTED" },
      { userId: "user-aleksandr", friendId: "user-ilya", status: "ACCEPTED" },
      { userId: "user-ilya", friendId: "user-aleksandr", status: "ACCEPTED" }
    ]
  });

  await prisma.place.createMany({
    data: [
      {
        id: "place-1",
        slug: "mika-alas",
        name: "Mika Alas Veliko Jezero",
        shortDescription: "Популярный карповый водоем под Белградом.",
        description: "Шикарное платное карповое озеро, где ловятся трофеи.",
        type: "PAYED",
        city: "Belgrade",
        region: "Cukarica",
        latitude: 44.7578,
        longitude: 20.3546,
        rating: 4.8,
        distanceKm: 4,
        depthMeters: 3.5,
        fishSpecies: "Карп, Карась, Амур",
        amenities: "Парковка, Навесы, Мангал, Ресторан",
        bestMonths: "Апрель, Май, Октябрь",
        coverImage: "https://images.unsplash.com/photo-1544335446-4cb7dfba852b?w=800&q=80",
        source: "USER",
        createdByUserId: "user-roman"
      },
      {
        id: "place-2",
        slug: "sava-river-mouth",
        name: "Устье реки Сава",
        shortDescription: "Дикое место для джига с лодки или берега",
        description: "Мощное течение и большие ямы, отлично подходит для ловли судака.",
        type: "WILD",
        city: "Belgrade",
        region: "Dorcol",
        latitude: 44.8258,
        longitude: 20.4455,
        rating: 4.5,
        distanceKm: 2,
        depthMeters: 6.0,
        fishSpecies: "Судак, Сом, Жерех",
        amenities: "Причал, Парковка",
        bestMonths: "Сентябрь, Октябрь, Ноябрь",
        coverImage: "https://images.unsplash.com/photo-1596700816919-61da12f5a049?w=800&q=80",
        source: "USER",
        createdByUserId: "user-ilya"
      }
    ]
  });

  await prisma.catch.createMany({
    data: [
      {
        id: "catch-1",
        userId: "user-roman",
        placeId: "place-1",
        species: "Карп",
        weightKg: 12.5,
        lengthCm: 85,
        bait: "Бойлы клубника",
        note: "Клюнул ночью, мощное сопротивление. Отличный трофей на открытие сезона.",
        imagePath: "https://images.unsplash.com/photo-1555529452-f47053e1a067?w=800&q=80",
        recognizedSpecies: "Карп",
        aiConfidence: 98,
        likesCount: 24,
        isFeatured: true,
        createdAt: subHours(new Date(), 24)
      },
      {
        id: "catch-2",
        userId: "user-ilya",
        placeId: "place-2",
        species: "Судак",
        weightKg: 4.2,
        lengthCm: 68,
        bait: "Силикон 4 дюйма",
        note: "Классный удар на падении в яму. Идеальная ночь на Саве.",
        imagePath: "https://images.unsplash.com/photo-1536486161986-77e8fd0117ff?w=800&q=80",
        recognizedSpecies: "Судак",
        aiConfidence: 95,
        likesCount: 15,
        isFeatured: false,
        createdAt: subHours(new Date(), 12)
      }
    ]
  });
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
