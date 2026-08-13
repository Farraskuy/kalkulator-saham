-- Rename the legacy board key without losing administrator-configured values.
UPDATE "AraArbRule"
SET "board" = 'FCA'
WHERE "board" = 'Watchlist'
  AND NOT EXISTS (SELECT 1 FROM "AraArbRule" WHERE "board" = 'FCA');

DELETE FROM "AraArbRule"
WHERE "board" = 'Watchlist'
  AND EXISTS (SELECT 1 FROM "AraArbRule" WHERE "board" = 'FCA');
