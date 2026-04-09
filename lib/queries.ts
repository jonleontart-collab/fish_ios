import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { splitPipeList } from "@/lib/format";
import { getFriendsForUser } from "@/lib/social";
import { ensureSupportChatForUser } from "@/lib/support";

const REAL_PLACE_FILTER = {
  source: {
    not: "SEEDED" as const,
  },
};

// Fallback images for beautiful empty states if Gemini fails to provide real photos
const FALLBACK_NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1544253139-4458f4a7c065?q=80&w=800&auto=format&fit=crop", // Lake morning
  "https://images.unsplash.com/photo-1504280741564-f2510257cd42?q=80&w=800&auto=format&fit=crop", // Misty river
  "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?q=80&w=800&auto=format&fit=crop", // Boat on lake
  "https://images.unsplash.com/photo-1439841893113-dcae8dbd808e?q=80&w=800&auto=format&fit=crop", // Mountain lake
  "https://images.unsplash.com/photo-1533830999080-606ec5688d07?q=80&w=800&auto=format&fit=crop", // Sunset calm river
];

function getDeterministicFallback(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_NATURE_IMAGES.length;
  return FALLBACK_NATURE_IMAGES[index];
}

function withDisplayImage<
  T extends {
    id: string; // Ensure we have ID for deterministic fallback
    name?: string;
    coverImage: string | null;
    photos?: Array<{ imagePath: string }>;
  },
>(place: T) {
  const actualImage = place.photos?.[0]?.imagePath ?? place.coverImage;
  
  return {
    ...place,
    displayImage: actualImage || getDeterministicFallback(place.id ?? place.name ?? "default"),
  };
}

function mapPlaceLists<
  T extends {
    fishSpecies: string;
    amenities: string;
    bestMonths: string;
  },
>(place: T) {
  return {
    ...place,
    fishSpeciesList: splitPipeList(place.fishSpecies),
    amenitiesList: splitPipeList(place.amenities),
    bestMonthsList: splitPipeList(place.bestMonths),
  };
}

function mapCatchWithEngagement<
  T extends {
    likesCount?: number;
    likes?: Array<{ id: string }>;
    reposts?: Array<{ id: string }>;
    _count?: {
      comments: number;
      likes: number;
      reposts?: number;
    };
  },
>(item: T) {
  return {
    ...item,
    commentsCount: item._count?.comments ?? 0,
    likesCount: item._count?.likes ?? item.likesCount ?? 0,
    likedByViewer: Boolean(item.likes?.length),
    repostsCount: item._count?.reposts ?? 0,
    repostedByViewer: Boolean(item.reposts?.length),
  };
}

function mapCatchMedia<
  T extends {
    imagePath: string;
    media?: Array<{
      id: string;
      mediaPath: string;
      mediaType: "IMAGE" | "VIDEO";
      sortOrder: number;
    }>;
  },
>(item: T) {
  const fallbackMedia = item.imagePath
    ? [
        {
          id: `${"id" in item && typeof item.id === "string" ? item.id : "legacy"}-cover`,
          mediaPath: item.imagePath,
          mediaType: "IMAGE" as const,
          sortOrder: 0,
        },
      ]
    : [];

  return {
    ...item,
    mediaItems: item.media && item.media.length > 0 ? [...item.media].sort((left, right) => left.sortOrder - right.sortOrder) : fallbackMedia,
  };
}

async function getRequiredCurrentUser() {
  const user = await getCurrentUser();

  if (user) {
    return user;
  }

  const fallbackUser = await prisma.user.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!fallbackUser) {
    throw new Error("No users found. Run npm run db:init.");
  }

  return fallbackUser;
}

async function getJoinedChats(userId: string, take?: number) {
  return prisma.chat.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      owner: true,
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatarGradient: true,
              avatarPath: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          messages: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ isSystem: "desc" }, { updatedAt: "desc" }],
    ...(typeof take === "number" ? { take } : {}),
  });
}

export async function getCurrentUser() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const uid = cookieStore.get("fishflow_uid")?.value;

  if (uid) {
    const current = await prisma.user.findUnique({
      where: { id: uid },
    });
    if (current) return current;
  }

  // Return null if not authenticated (will trigger Onboarding in layout)
  return null;
}

export async function getDashboardData() {
  const user = await getRequiredCurrentUser();
  await ensureSupportChatForUser(user.id);

  const [
    upcomingTrips,
    recentCatchesRaw,
    nearbyPlaces,
    activeChats,
    pendingShopping,
    pendingShoppingCount,
    upcomingTripsCount,
    inventoryCount,
    placesCount,
    weeklyCatches,
  ] = await Promise.all([
    prisma.trip.findMany({
      where: {
        userId: user.id,
        place: REAL_PLACE_FILTER,
        status: {
          in: ["PLANNED", "CONFIRMED"],
        },
        startAt: {
          gte: new Date(),
        },
      },
      include: {
        place: {
          include: {
            photos: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
      take: 3,
    }),
    prisma.catch.findMany({
      where: {
        place: REAL_PLACE_FILTER,
      },
      include: {
        user: true,
        place: true,
        media: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        likes: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
        reposts: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            reposts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
    prisma.place.findMany({
      where: REAL_PLACE_FILTER,
      include: {
        photos: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            catches: true,
            photos: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
    getJoinedChats(user.id, 3),
    prisma.shoppingItem.findMany({
      where: {
        userId: user.id,
        status: "PLANNED",
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 4,
    }),
    prisma.shoppingItem.count({
      where: {
        userId: user.id,
        status: "PLANNED",
      },
    }),
    prisma.trip.count({
      where: {
        userId: user.id,
        place: REAL_PLACE_FILTER,
        status: {
          in: ["PLANNED", "CONFIRMED"],
        },
        startAt: {
          gte: new Date(),
        },
      },
    }),
    prisma.inventoryItem.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.place.count({
      where: REAL_PLACE_FILTER,
    }),
    prisma.catch.count({
      where: {
        createdAt: {
          gte: subDays(new Date(), 7),
        },
        place: REAL_PLACE_FILTER,
      },
    }),
  ]);

  return {
    user,
    upcomingTrips: upcomingTrips.map((trip) => ({
      ...trip,
      place: withDisplayImage(trip.place),
    })),
    recentCatches: recentCatchesRaw.map((item) => mapCatchMedia(mapCatchWithEngagement(item))),
    nearbyPlaces: nearbyPlaces.map((place) => mapPlaceLists(withDisplayImage(place))),
    activeChats,
    pendingShopping,
    stats: {
      weeklyCatches,
      placesCount,
      inventoryCount,
      pendingShoppingCount,
      activeChatCount: activeChats.length,
      upcomingTripsCount,
    },
  };
}

export async function getFeedPageData() {
  const user = await getRequiredCurrentUser();
  await ensureSupportChatForUser(user.id);
  const [catchesRaw, tripReports, catchReposts] = await Promise.all([
    prisma.catch.findMany({
      where: {
        place: REAL_PLACE_FILTER,
      },
      include: {
        user: true,
        place: true,
        media: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        likes: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
        reposts: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            reposts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 40,
    }),
    prisma.trip.findMany({
      where: {
        publishedAt: {
          not: null,
        },
        place: REAL_PLACE_FILTER,
      },
      include: {
        user: true,
        place: {
          include: {
            photos: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 20,
    }),
    prisma.catchRepost.findMany({
      include: {
        user: true,
        catch: {
          include: {
            user: true,
            place: true,
            media: {
              orderBy: {
                sortOrder: "asc",
              },
            },
            likes: {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
              },
            },
            reposts: {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
                reposts: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),
  ]);

  const catches = catchesRaw.map((item) => mapCatchMedia(mapCatchWithEngagement(item)));
  const feedItems = [
    ...catches.map((item) => ({
      type: "catch" as const,
      sortDate: item.createdAt,
      catchItem: item,
    })),
    ...tripReports.map((item) => ({
      type: "trip" as const,
      sortDate: item.publishedAt ?? item.updatedAt,
      tripItem: {
        ...item,
        place: mapPlaceLists(withDisplayImage(item.place)),
      },
    })),
    ...catchReposts.map((item) => ({
      type: "repost" as const,
      sortDate: item.createdAt,
      catchItem: {
        ...mapCatchMedia(mapCatchWithEngagement(item.catch)),
        repostMeta: {
          user: item.user,
          createdAt: item.createdAt,
        },
      },
    })),
  ].sort((left, right) => right.sortDate.getTime() - left.sortDate.getTime());

  return { user, catches, tripReports, feedItems };
}

export async function getCatchPostData(catchId: string) {
  const user = await getRequiredCurrentUser();

  const catchItem = await prisma.catch.findFirst({
    where: {
      id: catchId,
      place: REAL_PLACE_FILTER,
    },
    include: {
      user: true,
      place: true,
      media: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      likes: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      },
      reposts: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
          reposts: true,
        },
      },
    },
  });

  if (!catchItem) {
    return null;
  }

  return {
    user,
    catchItem: mapCatchMedia(mapCatchWithEngagement(catchItem)),
  };
}

export async function getPlacesCatalog() {
  const places = await prisma.place.findMany({
    where: REAL_PLACE_FILTER,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          handle: true,
        },
      },
      photos: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      _count: {
        select: {
          catches: true,
          photos: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return places.map((place) => mapPlaceLists(withDisplayImage(place)));
}

export async function getPlaceDetails(slug: string) {
  const user = await getCurrentUser();

  const place = await prisma.place.findFirst({
    where: {
      slug,
      ...REAL_PLACE_FILTER,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          handle: true,
          avatarGradient: true,
        },
      },
      photos: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
      catches: {
        include: {
          user: true,
          place: true,
          media: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          likes: user
            ? {
                where: {
                  userId: user.id,
                },
                select: {
                  id: true,
                },
              }
            : false,
          reposts: user
            ? {
                where: {
                  userId: user.id,
                },
                select: {
                  id: true,
                },
              }
            : false,
          _count: {
            select: {
              comments: true,
              likes: true,
              reposts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
    },
  });

  if (!place) {
    return null;
  }

  return {
    ...mapPlaceLists(withDisplayImage(place)),
    catches: place.catches.map((item) => mapCatchMedia(mapCatchWithEngagement(item))),
  };
}

export async function getPlaceOptions() {
  return prisma.place.findMany({
    where: REAL_PLACE_FILTER,
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      source: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getChatsInboxData() {
  const user = await getRequiredCurrentUser();
  await ensureSupportChatForUser(user.id);
  const [chats, discoverableChats, friends] = await Promise.all([
    getJoinedChats(user.id),
    prisma.chat.findMany({
      where: {
        isSystem: false,
        visibility: "OPEN",
        members: {
          none: {
            userId: user.id,
          },
        },
      },
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    }),
    getFriendsForUser(user.id),
  ]);

  return {
    user,
    chats,
    discoverableChats,
    friends,
  };
}

export async function getChatThreadData(slug: string) {
  const user = await getRequiredCurrentUser();
  await ensureSupportChatForUser(user.id);
  const [chats, discoverableChats, activeChat] = await Promise.all([
    getJoinedChats(user.id),
    prisma.chat.findMany({
      where: {
        isSystem: false,
        visibility: "OPEN",
        members: {
          none: {
            userId: user.id,
          },
        },
      },
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    }),
    prisma.chat.findFirst({
      where: {
        slug,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 120,
        },
      },
    }),
  ]);

  return {
    user,
    chats,
    discoverableChats,
    activeChat,
  };
}

export async function getTripsPageData() {
  const user = await getRequiredCurrentUser();

  const [trips, placeOptions, shoppingItems, inventoryItems] = await Promise.all([
    prisma.trip.findMany({
      where: {
        userId: user.id,
        place: REAL_PLACE_FILTER,
      },
      include: {
        place: {
          include: {
            photos: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ startAt: "desc" }, { createdAt: "desc" }],
    }),
    getPlaceOptions(),
    prisma.shoppingItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    }),
    prisma.inventoryItem.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return {
    user,
    trips: trips.map((trip) => ({
      ...trip,
      place: mapPlaceLists(withDisplayImage(trip.place)),
    })),
    placeOptions,
    shoppingItems,
    inventoryItems,
  };
}

export async function getProfilePageData() {
  const user = await getRequiredCurrentUser();

  const [catchesRaw, trips, placePhotos, commentsCount, inventoryItems, shoppingItems, catchCount, tripCount, friends] =
    await Promise.all([
      prisma.catch.findMany({
        where: { userId: user.id, place: REAL_PLACE_FILTER },
        include: {
          user: true,
          place: true,
          media: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          likes: { where: { userId: user.id }, select: { id: true } },
          reposts: { where: { userId: user.id }, select: { id: true } },
          _count: { select: { comments: true, likes: true, reposts: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.trip.findMany({
        where: { userId: user.id, place: REAL_PLACE_FILTER },
        include: { place: { include: { photos: { orderBy: { createdAt: "desc" }, take: 1 } } } },
        orderBy: { startAt: "desc" },
        take: 12,
      }),
      prisma.placePhoto.count({ where: { userId: user.id, place: REAL_PLACE_FILTER } }),
      prisma.catchComment.count({ where: { userId: user.id } }),
      prisma.inventoryItem.findMany({ where: { userId: user.id }, orderBy: [{ category: "asc" }, { createdAt: "asc" }] }),
      prisma.shoppingItem.findMany({
        where: { userId: user.id },
        include: { trip: { select: { id: true, title: true } } },
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      }),
      prisma.catch.count({ where: { userId: user.id, place: REAL_PLACE_FILTER } }),
      prisma.trip.count({ where: { userId: user.id, place: REAL_PLACE_FILTER } }),
      getFriendsForUser(user.id),
    ]);

  const catches = catchesRaw.map((item) => mapCatchMedia(mapCatchWithEngagement(item)));

  return {
    user,
    catches,
    trips: trips.map((trip) => ({ ...trip, place: mapPlaceLists(withDisplayImage(trip.place)) })),
    inventoryItems,
    shoppingItems,
    friends,
    stats: {
      catches: catchCount,
      trips: tripCount,
      placePhotos,
      comments: commentsCount,
      inventory: inventoryItems.length,
      pendingShopping: shoppingItems.filter((item) => item.status === "PLANNED").length,
      friends: friends.length,
    },
  };
}
