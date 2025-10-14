-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'DG', 'DIRECTOR_GENERAL', 'BACK_OFFICE', 'COMMERCIAL', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'LOCKED');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('KIID', 'PROSPECTUS', 'FACTSHEET', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "lastLogin" TIMESTAMP(3),
    "verificationToken" VARCHAR(36),
    "verificationTokenExpiry" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" VARCHAR(36),
    "resetPasswordTokenExpiry" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "previousPasswords" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "refreshToken" TEXT,
    "refreshTokenExpiry" TIMESTAMP(3),
    "lastIp" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "metadata" JSONB DEFAULT '{}',
    "expiresAt" TIMESTAMP(3),
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "twoFactorBackupCodes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funds" (
    "id" TEXT NOT NULL,
    "fundCode" VARCHAR(100) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MAD',
    "navValue" DECIMAL(12,6),
    "navDate" TIMESTAMP(3),
    "dailyChangeBps" INTEGER,
    "yearPerformanceBps" INTEGER,
    "maroclearCode" VARCHAR(50),
    "categoryId" TEXT,
    "creationDate" TIMESTAMP(3),
    "initialNav" DECIMAL(12,6),
    "maxSubscriptionFeeBps" INTEGER,
    "maxRedemptionFeeBps" INTEGER,
    "maxManagementFeeBps" INTEGER,
    "benchmarkIndex" VARCHAR(255),
    "sensitivityRange" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundPreview" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "benchmarkIndex" VARCHAR(255),
    "sensitivityRange" VARCHAR(255),
    "maxSubscriptionFeeBps" INTEGER,
    "maxRedemptionFeeBps" INTEGER,
    "maxManagementFeeBps" INTEGER,
    "navValue" DECIMAL(12,6),
    "navDate" TIMESTAMP(3),
    "proposedBy" VARCHAR(36),
    "proposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "note" VARCHAR(255),

    CONSTRAINT "FundPreview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundTranslation" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255),
    "legalForm" VARCHAR(50),
    "resultsAllocation" VARCHAR(100),
    "navFrequency" VARCHAR(100),
    "subscribers" VARCHAR(100),
    "minimumSubscription" VARCHAR(255),
    "orderSubmissionTime" VARCHAR(255),
    "investmentHorizon" VARCHAR(255),
    "strategy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundTranslationPreview" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255),
    "legalForm" VARCHAR(50),
    "resultsAllocation" VARCHAR(100),
    "navFrequency" VARCHAR(100),
    "subscribers" VARCHAR(100),
    "minimumSubscription" VARCHAR(255),
    "orderSubmissionTime" VARCHAR(255),
    "investmentHorizon" VARCHAR(255),
    "strategy" TEXT,
    "proposedBy" VARCHAR(36),
    "proposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "note" VARCHAR(255),

    CONSTRAINT "FundTranslationPreview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundValuation" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nav" DECIMAL(12,6) NOT NULL,
    "dailyChangeBps" INTEGER,
    "ytdPerformanceBps" INTEGER,

    CONSTRAINT "FundValuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundDocument" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "locale" VARCHAR(10),
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "FundDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundDistributor" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),

    CONSTRAINT "FundDistributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundDraft" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "benchmarkIndex" VARCHAR(255),
    "sensitivityRange" VARCHAR(255),
    "maxSubscriptionFeeBps" INTEGER,
    "maxRedemptionFeeBps" INTEGER,
    "maxManagementFeeBps" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_user_assignments" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fund_user_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "userId" UUID,
    "targetUserId" UUID,
    "resource" VARCHAR(50) NOT NULL,
    "resourceId" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "status" VARCHAR(10) NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "funds_fundCode_key" ON "funds"("fundCode");

-- CreateIndex
CREATE INDEX "funds_navDate_idx" ON "funds"("navDate");

-- CreateIndex
CREATE INDEX "funds_categoryId_idx" ON "funds"("categoryId");

-- CreateIndex
CREATE INDEX "funds_maroclearCode_idx" ON "funds"("maroclearCode");

-- CreateIndex
CREATE UNIQUE INDEX "FundPreview_fundId_key" ON "FundPreview"("fundId");

-- CreateIndex
CREATE INDEX "FundTranslation_locale_idx" ON "FundTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "FundTranslation_fundId_locale_key" ON "FundTranslation"("fundId", "locale");

-- CreateIndex
CREATE INDEX "FundTranslationPreview_locale_idx" ON "FundTranslationPreview"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "FundTranslationPreview_fundId_locale_key" ON "FundTranslationPreview"("fundId", "locale");

-- CreateIndex
CREATE INDEX "FundValuation_fundId_date_idx" ON "FundValuation"("fundId", "date");

-- CreateIndex
CREATE INDEX "FundValuation_date_idx" ON "FundValuation"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FundValuation_fundId_date_key" ON "FundValuation"("fundId", "date");

-- CreateIndex
CREATE INDEX "FundDocument_fundId_kind_locale_publishedAt_idx" ON "FundDocument"("fundId", "kind", "locale", "publishedAt");

-- CreateIndex
CREATE INDEX "FundDocument_kind_locale_idx" ON "FundDocument"("kind", "locale");

-- CreateIndex
CREATE INDEX "FundDistributor_fundId_idx" ON "FundDistributor"("fundId");

-- CreateIndex
CREATE INDEX "FundDistributor_name_idx" ON "FundDistributor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FundDraft_fundId_key" ON "FundDraft"("fundId");

-- CreateIndex
CREATE INDEX "fund_user_assignments_fundId_idx" ON "fund_user_assignments"("fundId");

-- CreateIndex
CREATE INDEX "fund_user_assignments_userId_idx" ON "fund_user_assignments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "fund_user_assignments_fundId_userId_key" ON "fund_user_assignments"("fundId", "userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "funds" ADD CONSTRAINT "funds_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundPreview" ADD CONSTRAINT "FundPreview_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundTranslation" ADD CONSTRAINT "FundTranslation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundTranslationPreview" ADD CONSTRAINT "FundTranslationPreview_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundValuation" ADD CONSTRAINT "FundValuation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundDocument" ADD CONSTRAINT "FundDocument_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundDistributor" ADD CONSTRAINT "FundDistributor_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundDraft" ADD CONSTRAINT "FundDraft_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_user_assignments" ADD CONSTRAINT "fund_user_assignments_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_user_assignments" ADD CONSTRAINT "fund_user_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
