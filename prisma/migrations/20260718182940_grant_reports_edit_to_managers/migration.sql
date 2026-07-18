-- Bestehende Konten mit Kassen-Verwaltung erhalten die neue Berechtigung
-- (separate Migration, da ein neuer Enum-Wert nicht in derselben Transaktion
-- verwendet werden darf, in der er angelegt wurde)
UPDATE "AdminUser"
SET "permissions" = "permissions" || 'KASSE_REPORTS_EDIT'::"Permission"
WHERE 'KASSE_MANAGE' = ANY("permissions")
  AND NOT ('KASSE_REPORTS_EDIT' = ANY("permissions"));
