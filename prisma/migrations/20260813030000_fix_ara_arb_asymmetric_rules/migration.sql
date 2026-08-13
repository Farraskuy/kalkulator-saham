-- Correct legacy seed boundaries to the official BEI price-fraction ranges.
UPDATE "FractionRule" SET "maxPrice" = 199 WHERE "minPrice" = 1 AND "maxPrice" = 200 AND "tick" = 1;
UPDATE "FractionRule" SET "minPrice" = 200, "maxPrice" = 499 WHERE "minPrice" = 201 AND "maxPrice" = 500 AND "tick" = 2;
UPDATE "FractionRule" SET "minPrice" = 500, "maxPrice" = 1999 WHERE "minPrice" = 501 AND "maxPrice" = 2000 AND "tick" = 5;
UPDATE "FractionRule" SET "minPrice" = 2000, "maxPrice" = 4999 WHERE "minPrice" = 2001 AND "maxPrice" = 5000 AND "tick" = 10;
UPDATE "FractionRule" SET "minPrice" = 5000 WHERE "minPrice" = 5001 AND "tick" = 25;

-- Since 8 April 2025, Main/Development boards use asymmetric limits:
-- tiered ARA (35/25/20 percent) and 15 percent ARB for all price ranges.
INSERT INTO "AraArbRule" ("id", "board", "ara", "arb")
VALUES
  ('ara_arb_utama_50_200', 'Utama_50_200', 35, 15),
  ('ara_arb_utama_200_5000', 'Utama_200_5000', 25, 15),
  ('ara_arb_utama_5000', 'Utama_5000', 20, 15)
ON CONFLICT ("board") DO NOTHING;
