-- DropForeignKey
ALTER TABLE "item-categories" DROP CONSTRAINT "item-categories_parent_fkey";

-- DropForeignKey
ALTER TABLE "stock-item-records" DROP CONSTRAINT "stock-item-records_stock_item_fkey";

-- DropForeignKey
ALTER TABLE "stock-items" DROP CONSTRAINT "stock-items_itemId_fkey";

-- AlterTable
ALTER TABLE "item-categories" ALTER COLUMN "parent" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "item-categories" ADD CONSTRAINT "item-categories_parent_fkey" FOREIGN KEY ("parent") REFERENCES "item-categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock-items" ADD CONSTRAINT "stock-items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock-item-records" ADD CONSTRAINT "stock-item-records_stock_item_fkey" FOREIGN KEY ("stock_item") REFERENCES "stock-items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
