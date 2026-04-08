import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "prisma" / "dev.db"

SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "handle" TEXT NOT NULL,
  "bio" TEXT,
  "city" TEXT,
  "experienceYears" INTEGER,
  "preferredStyles" TEXT,
  "homeWater" TEXT,
  "avatarGradient" TEXT NOT NULL,
  "avatarPath" TEXT,
  "bannerPath" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

CREATE TABLE "Place" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "shortDescription" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('WILD', 'PAYED', 'CLUB')),
  "city" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "latitude" REAL NOT NULL,
  "longitude" REAL NOT NULL,
  "distanceKm" INTEGER,
  "rating" REAL NOT NULL,
  "depthMeters" REAL,
  "fishSpecies" TEXT NOT NULL,
  "amenities" TEXT NOT NULL,
  "bestMonths" TEXT NOT NULL,
  "coverImage" TEXT,
  "source" TEXT NOT NULL DEFAULT 'SEEDED' CHECK ("source" IN ('SEEDED', 'GEMINI', 'USER')),
  "sourceUrl" TEXT,
  "aiSummary" TEXT,
  "createdByUserId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Place_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");
CREATE INDEX "Place_source_createdAt_idx" ON "Place"("source", "createdAt");

CREATE TABLE "Chat" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "accentColor" TEXT NOT NULL,
  "visibility" TEXT NOT NULL DEFAULT 'OPEN' CHECK ("visibility" IN ('OPEN', 'PRIVATE')),
  "locationLabel" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Chat_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Chat_slug_key" ON "Chat"("slug");

CREATE TABLE "Catch" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "weightKg" REAL,
  "lengthCm" INTEGER,
  "bait" TEXT,
  "note" TEXT,
  "imagePath" TEXT NOT NULL,
  "recognizedSpecies" TEXT,
  "recognizedLengthCm" INTEGER,
  "aiConfidence" INTEGER,
  "likesCount" INTEGER NOT NULL DEFAULT 0,
  "isFeatured" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Catch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Catch_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Catch_createdAt_idx" ON "Catch"("createdAt");
CREATE INDEX "Catch_userId_createdAt_idx" ON "Catch"("userId", "createdAt");
CREATE INDEX "Catch_placeId_createdAt_idx" ON "Catch"("placeId", "createdAt");

CREATE TABLE "CatchLike" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "catchId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatchLike_catchId_fkey" FOREIGN KEY ("catchId") REFERENCES "Catch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CatchLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CatchLike_catchId_userId_key" ON "CatchLike"("catchId", "userId");
CREATE INDEX "CatchLike_userId_createdAt_idx" ON "CatchLike"("userId", "createdAt");

CREATE TABLE "CatchComment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "catchId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatchComment_catchId_fkey" FOREIGN KEY ("catchId") REFERENCES "Catch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CatchComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CatchComment_catchId_createdAt_idx" ON "CatchComment"("catchId", "createdAt");
CREATE INDEX "CatchComment_userId_createdAt_idx" ON "CatchComment"("userId", "createdAt");

CREATE TABLE "Trip" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "goals" TEXT,
  "summary" TEXT,
  "reportImagePath" TEXT,
  "startAt" DATETIME NOT NULL,
  "endAt" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'PLANNED' CHECK ("status" IN ('PLANNED', 'CONFIRMED', 'COMPLETED')),
  "publishedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Trip_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Trip_userId_startAt_idx" ON "Trip"("userId", "startAt");
CREATE INDEX "Trip_publishedAt_idx" ON "Trip"("publishedAt");

CREATE TABLE "InventoryItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "InventoryItem_userId_createdAt_idx" ON "InventoryItem"("userId", "createdAt");

CREATE TABLE "ShoppingItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tripId" TEXT,
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'PLANNED' CHECK ("status" IN ('PLANNED', 'BOUGHT')),
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShoppingItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ShoppingItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ShoppingItem_userId_status_createdAt_idx" ON "ShoppingItem"("userId", "status", "createdAt");
CREATE INDEX "ShoppingItem_tripId_idx" ON "ShoppingItem"("tripId");

CREATE TABLE "ChatMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "isMuted" BOOLEAN NOT NULL DEFAULT 0,
  "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ChatMember_chatId_userId_key" ON "ChatMember"("chatId", "userId");

CREATE TABLE "Message" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

CREATE TABLE "PlacePhoto" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "placeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "imagePath" TEXT NOT NULL,
  "caption" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlacePhoto_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PlacePhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PlacePhoto_placeId_createdAt_idx" ON "PlacePhoto"("placeId", "createdAt");
CREATE INDEX "PlacePhoto_userId_createdAt_idx" ON "PlacePhoto"("userId", "createdAt");
"""


def main():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()

    connection = sqlite3.connect(DB_PATH)
    try:
        connection.executescript(SQL)
        connection.commit()
    finally:
        connection.close()

    print(DB_PATH)


if __name__ == "__main__":
    main()
