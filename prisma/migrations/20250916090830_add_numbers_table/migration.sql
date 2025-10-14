-- CreateTable
CREATE TABLE "numbers" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "description" VARCHAR(200),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "numbers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "numbers_key_key" ON "numbers"("key");

-- CreateIndex
CREATE INDEX "numbers_key_idx" ON "numbers"("key");

-- CreateIndex
CREATE INDEX "numbers_isActive_idx" ON "numbers"("isActive");

-- CreateIndex
CREATE INDEX "numbers_order_idx" ON "numbers"("order");
