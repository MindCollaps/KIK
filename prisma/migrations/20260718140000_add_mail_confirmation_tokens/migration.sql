-- CreateEnum
CREATE TYPE "AdminTokenType" AS ENUM ('INVITE', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "emailConfirmedAt" TIMESTAMP(3);

-- Bestehende Konten gelten als bestätigt
UPDATE "AdminUser" SET "emailConfirmedAt" = "createdAt";

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

-- CreateIndex
CREATE UNIQUE INDEX "AdminUserToken_tokenHash_key" ON "AdminUserToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminUserToken_userId_idx" ON "AdminUserToken"("userId");

-- CreateIndex
CREATE INDEX "AdminUserToken_expiresAt_idx" ON "AdminUserToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "AdminUserToken" ADD CONSTRAINT "AdminUserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
