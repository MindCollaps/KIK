-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ProgramStyle" AS ENUM ('DEFAULT', 'SPECIAL', 'HIGHLIGHTED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'info',
    "status" "PageStatus" NOT NULL DEFAULT 'PUBLISHED',
    "blocks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupState" (
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetupState_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ProgramEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "language" TEXT,
    "runtimeMinutes" INTEGER,
    "ageRating" TEXT,
    "director" TEXT,
    "country" TEXT,
    "releaseYear" INTEGER,
    "infoUrl" TEXT,
    "priceCents" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "style" "ProgramStyle" NOT NULL DEFAULT 'DEFAULT',
    "highlightColor" TEXT,
    "customBadgeText" TEXT,
    "customBadgeBorder" BOOLEAN NOT NULL DEFAULT false,
    "imagePath" TEXT,
    "imageAlt" TEXT,
    "doesTheDogDieId" INTEGER,
    "contentWarnings" JSONB,
    "contentWarningsUpdatedAt" TIMESTAMP(3),
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "visibleFrom" TIMESTAMP(3),
    "visibleUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "ProgramEntry_status_startsAt_idx" ON "ProgramEntry"("status", "startsAt");

-- CreateIndex
CREATE INDEX "ProgramEntry_status_visibleFrom_visibleUntil_idx" ON "ProgramEntry"("status", "visibleFrom", "visibleUntil");

-- CreateIndex
CREATE INDEX "ProgramEntry_doesTheDogDieId_idx" ON "ProgramEntry"("doesTheDogDieId");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
