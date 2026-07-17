-- AlterTable
ALTER TABLE "ProgramEntry" ADD COLUMN     "customBadgeIcon" TEXT,
ADD COLUMN     "customCardBorder" BOOLEAN NOT NULL DEFAULT false;
