/*
  Warnings:

  - You are about to drop the column `weeklyId` on the `ref_sites` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ref_sites" DROP CONSTRAINT "ref_sites_weeklyId_fkey";

-- AlterTable
ALTER TABLE "ref_sites" DROP COLUMN "weeklyId";

-- AlterTable
ALTER TABLE "weekly" ADD COLUMN     "sites" TEXT[];
