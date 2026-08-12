ALTER TABLE "FaqItem" ADD COLUMN "slug" TEXT;
UPDATE "FaqItem" SET "slug" = 'faq-' || "id" WHERE "slug" IS NULL;
ALTER TABLE "FaqItem" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "FaqItem_slug_key" ON "FaqItem"("slug");
