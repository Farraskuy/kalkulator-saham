ALTER TABLE "Article" ADD COLUMN "isTraderPick" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Article_status_isTraderPick_publishedAt_idx"
ON "Article"("status", "isTraderPick", "publishedAt");
