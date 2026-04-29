-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('read', 'write', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,
    "permission_level" "PermissionLevel" NOT NULL DEFAULT 'read',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item-categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent" INTEGER NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item-categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock-items" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "manufacturer" TEXT,
    "vendor" TEXT,
    "url" TEXT,
    "location" TEXT NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock-items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock-item-records" (
    "id" SERIAL NOT NULL,
    "stock_item" INTEGER NOT NULL,
    "field_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "old_value" TEXT NOT NULL,
    "user_id" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock-item-records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "items_name_idx" ON "items"("name");

-- CreateIndex
CREATE INDEX "item-categories_name_idx" ON "item-categories"("name");

-- CreateIndex
CREATE INDEX "item-categories_parent_idx" ON "item-categories"("parent");

-- CreateIndex
CREATE INDEX "stock-items_itemId_idx" ON "stock-items"("itemId");

-- CreateIndex
CREATE INDEX "stock-item-records_stock_item_idx" ON "stock-item-records"("stock_item");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item-categories" ADD CONSTRAINT "item-categories_parent_fkey" FOREIGN KEY ("parent") REFERENCES "item-categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item-categories" ADD CONSTRAINT "item-categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock-items" ADD CONSTRAINT "stock-items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock-items" ADD CONSTRAINT "stock-items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock-item-records" ADD CONSTRAINT "stock-item-records_stock_item_fkey" FOREIGN KEY ("stock_item") REFERENCES "stock-items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock-item-records" ADD CONSTRAINT "stock-item-records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
