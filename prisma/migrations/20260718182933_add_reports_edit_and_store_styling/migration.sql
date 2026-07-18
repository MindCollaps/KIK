-- AlterEnum
ALTER TYPE "Permission" ADD VALUE 'KASSE_REPORTS_EDIT';

-- AlterEnum
ALTER TYPE "StoreLogType" ADD VALUE 'TAGESABSCHLUSS_UPDATED';

-- AlterTable
ALTER TABLE "StoreCategory" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "StoreItem" ADD COLUMN     "color" TEXT;
