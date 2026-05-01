/*
  Warnings:

  - Added the required column `category` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" ADD COLUMN     "category" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_fkey" FOREIGN KEY ("category") REFERENCES "item-categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
