/*
  Warnings:

  - You are about to drop the column `permission_level` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "permission_level",
ADD COLUMN     "role" "PermissionLevel" NOT NULL DEFAULT 'read';
