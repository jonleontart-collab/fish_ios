import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_HANDLES = ["aleksandr", "marina_spin", "ilya_night", "roman_carp"];
const DEMO_PLACE_IDS = ["place-mika-alas", "place-sava-mouth", "place-silver-reeds"];

async function main() {
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      handle: {
        in: DEMO_HANDLES,
      },
    },
  });

  const deletedPlaces = await prisma.place.deleteMany({
    where: {
      id: {
        in: DEMO_PLACE_IDS,
      },
    },
  });

  console.log(`Deleted demo users: ${deletedUsers.count}`);
  console.log(`Deleted demo places: ${deletedPlaces.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
