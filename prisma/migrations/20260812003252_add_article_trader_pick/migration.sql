-- DropIndex
DROP INDEX "Article_status_publishedAt_idx";

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
