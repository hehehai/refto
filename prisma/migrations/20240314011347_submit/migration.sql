/*
  Warnings:

  - Added the required column `email` to the `submit_sites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "submit_sites" ADD COLUMN     "email" TEXT NOT NULL;
