-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ProgramStyle" AS ENUM ('DEFAULT', 'SPECIAL', 'HIGHLIGHTED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('PAGES', 'PROGRAM', 'SETTINGS', 'KASSE_USE', 'KASSE_REPORTS', 'KASSE_MANAGE', 'USERS');

-- CreateEnum
CREATE TYPE "AdminTokenType" AS ENUM ('INVITE', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "BonStatus" AS ENUM ('COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD');

-- CreateEnum
CREATE TYPE "StoreLogType" AS ENUM ('CATEGORY_CREATED', 'CATEGORY_UPDATED', 'ITEM_CREATED', 'ITEM_UPDATED', 'BON_CREATED', 'BON_CANCELLED', 'TAGESABSCHLUSS_CREATED');

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
    "permissions" "Permission"[] DEFAULT ARRAY[]::"Permission"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "emailConfirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUserToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "type" "AdminTokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUserToken_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "StoreCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "freePrice" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bon" (
    "number" SERIAL NOT NULL,
    "status" "BonStatus" NOT NULL DEFAULT 'COMPLETED',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" TEXT,
    "cancelledByName" TEXT,
    "cancelReason" TEXT,
    "tagesabschlussId" INTEGER,

    CONSTRAINT "Bon_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "BonItem" (
    "id" TEXT NOT NULL,
    "bonNumber" INTEGER NOT NULL,
    "itemId" TEXT,
    "name" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "BonItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagesabschluss" (
    "number" SERIAL NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "openingCashCents" INTEGER NOT NULL,
    "countedCashCents" INTEGER NOT NULL,
    "expectedCashCents" INTEGER NOT NULL,
    "differenceCents" INTEGER NOT NULL,
    "revenueCents" INTEGER NOT NULL,
    "cashRevenueCents" INTEGER NOT NULL,
    "cardRevenueCents" INTEGER NOT NULL,
    "bonCount" INTEGER NOT NULL,
    "stornoCount" INTEGER NOT NULL,
    "stornoTotalCents" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tagesabschluss_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "StoreAuditLog" (
    "id" TEXT NOT NULL,
    "type" "StoreLogType" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "bonNumber" INTEGER,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreAuditLog_pkey" PRIMARY KEY ("id")
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
    "customBadgeIcon" TEXT,
    "customCardBorder" BOOLEAN NOT NULL DEFAULT false,
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
CREATE UNIQUE INDEX "AdminUserToken_tokenHash_key" ON "AdminUserToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminUserToken_userId_idx" ON "AdminUserToken"("userId");

-- CreateIndex
CREATE INDEX "AdminUserToken_expiresAt_idx" ON "AdminUserToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "StoreItem_categoryId_idx" ON "StoreItem"("categoryId");

-- CreateIndex
CREATE INDEX "Bon_status_createdAt_idx" ON "Bon"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Bon_tagesabschlussId_idx" ON "Bon"("tagesabschlussId");

-- CreateIndex
CREATE INDEX "BonItem_bonNumber_idx" ON "BonItem"("bonNumber");

-- CreateIndex
CREATE INDEX "BonItem_itemId_idx" ON "BonItem"("itemId");

-- CreateIndex
CREATE INDEX "StoreAuditLog_createdAt_idx" ON "StoreAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "StoreAuditLog_type_idx" ON "StoreAuditLog"("type");

-- CreateIndex
CREATE INDEX "ProgramEntry_status_startsAt_idx" ON "ProgramEntry"("status", "startsAt");

-- CreateIndex
CREATE INDEX "ProgramEntry_status_visibleFrom_visibleUntil_idx" ON "ProgramEntry"("status", "visibleFrom", "visibleUntil");

-- CreateIndex
CREATE INDEX "ProgramEntry_doesTheDogDieId_idx" ON "ProgramEntry"("doesTheDogDieId");

-- AddForeignKey
ALTER TABLE "AdminUserToken" ADD CONSTRAINT "AdminUserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreItem" ADD CONSTRAINT "StoreItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StoreCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bon" ADD CONSTRAINT "Bon_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bon" ADD CONSTRAINT "Bon_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bon" ADD CONSTRAINT "Bon_tagesabschlussId_fkey" FOREIGN KEY ("tagesabschlussId") REFERENCES "Tagesabschluss"("number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonItem" ADD CONSTRAINT "BonItem_bonNumber_fkey" FOREIGN KEY ("bonNumber") REFERENCES "Bon"("number") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonItem" ADD CONSTRAINT "BonItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagesabschluss" ADD CONSTRAINT "Tagesabschluss_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
