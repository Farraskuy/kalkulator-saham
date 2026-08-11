CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "Article"
ADD COLUMN "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED';

ALTER TABLE "Article"
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

CREATE INDEX "Article_status_publishedAt_idx"
ON "Article"("status", "publishedAt" DESC);
