/*
  Warnings:

  - You are about to drop the column `likes` on the `ref_sites` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ref_sites" DROP COLUMN "likes",
ADD COLUMN     "siteCoverRecord" TEXT DEFAULT '',
ADD COLUMN     "siteRecord" TEXT DEFAULT '';

-- CreateTable
CREATE TABLE "ref_site_likes" (
    "id" TEXT NOT NULL,
    "refSiteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ref_site_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ref_site_likes_refSiteId_userId_key" ON "ref_site_likes"("refSiteId", "userId");

-- AddForeignKey
ALTER TABLE "ref_site_likes" ADD CONSTRAINT "ref_site_likes_refSiteId_fkey" FOREIGN KEY ("refSiteId") REFERENCES "ref_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ref_site_likes" ADD CONSTRAINT "ref_site_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
