-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- Aus bestehenden Sitzungen ableiten
UPDATE "AdminUser" AS u
SET "lastLoginAt" = s."latest"
FROM (
    SELECT "userId", MAX("createdAt") AS "latest"
    FROM "AdminSession"
    GROUP BY "userId"
) AS s
WHERE s."userId" = u.id;
