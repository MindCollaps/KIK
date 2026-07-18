-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('PAGES', 'PROGRAM', 'SETTINGS', 'KASSE_USE', 'KASSE_REPORTS', 'KASSE_MANAGE', 'USERS');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "permissions" "Permission"[] DEFAULT ARRAY[]::"Permission"[];

-- Bestehende Konten behalten vollen Zugriff
UPDATE "AdminUser" SET "permissions" = ARRAY['PAGES', 'PROGRAM', 'SETTINGS', 'KASSE_USE', 'KASSE_REPORTS', 'KASSE_MANAGE', 'USERS']::"Permission"[];
