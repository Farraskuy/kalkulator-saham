-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" ("id" TEXT NOT NULL, "name" TEXT, "email" TEXT NOT NULL, "emailVerified" TIMESTAMP(3), "image" TEXT, "role" "Role" NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Account" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT, CONSTRAINT "Account_pkey" PRIMARY KEY ("id"));
CREATE TABLE "CalculationHistory" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "calculatorType" TEXT NOT NULL, "title" TEXT NOT NULL, "inputs" JSONB NOT NULL, "results" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CalculationHistory_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AdminUser" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id"));
CREATE TABLE "FractionRule" ("id" TEXT NOT NULL, "minPrice" DOUBLE PRECISION NOT NULL, "maxPrice" DOUBLE PRECISION NOT NULL, "tick" DOUBLE PRECISION NOT NULL, CONSTRAINT "FractionRule_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AraArbRule" ("id" TEXT NOT NULL, "board" TEXT NOT NULL, "ara" DOUBLE PRECISION NOT NULL, "arb" DOUBLE PRECISION NOT NULL, CONSTRAINT "AraArbRule_pkey" PRIMARY KEY ("id"));
CREATE TABLE "TrafficLog" ("id" TEXT NOT NULL, "referrer" TEXT NOT NULL, "path" TEXT NOT NULL, "userAgent" TEXT NOT NULL, "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TrafficLog_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ActionLog" ("id" TEXT NOT NULL, "calculatorType" TEXT NOT NULL, "action" TEXT NOT NULL, "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id"));
CREATE TABLE "SystemSetting" ("key" TEXT NOT NULL, "value" TEXT NOT NULL, CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key"));
CREATE TABLE "FaqItem" ("id" TEXT NOT NULL, "question" TEXT NOT NULL, "answer" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Category" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Category_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Article" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "excerpt" TEXT NOT NULL, "content" TEXT NOT NULL, "category" TEXT NOT NULL, "type" TEXT NOT NULL DEFAULT 'BLOG', "coverImage" TEXT, "author" TEXT DEFAULT 'Tim Redaksi', "source" TEXT DEFAULT 'HitungSaham NEWS', "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Article_pkey" PRIMARY KEY ("id"));

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "AraArbRule_board_key" ON "AraArbRule"("board");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalculationHistory" ADD CONSTRAINT "CalculationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
