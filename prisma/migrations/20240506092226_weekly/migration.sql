/*
  Warnings:

  - Added the required column `updated_at` to the `weekly` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WeeklySentStatus" AS ENUM ('AWAITING', 'PENDING', 'SENT');

-- AlterTable
ALTER TABLE "weekly" ADD COLUMN     "status" "WeeklySentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
