/*
  Warnings:

  - You are about to drop the `weekly_on_subscriber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "weekly_on_subscriber" DROP CONSTRAINT "weekly_on_subscriber_subscriberId_fkey";

-- DropForeignKey
ALTER TABLE "weekly_on_subscriber" DROP CONSTRAINT "weekly_on_subscriber_weeklyId_fkey";

-- AlterTable
ALTER TABLE "email_subscriptions" ADD COLUMN     "weekly" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "weekly_on_subscriber";
