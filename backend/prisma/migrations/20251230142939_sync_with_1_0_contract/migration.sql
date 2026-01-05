/*
  Warnings:

  - You are about to drop the column `height` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `sessionDuration` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "height",
DROP COLUMN "sessionDuration",
DROP COLUMN "weight",
ADD COLUMN     "height_cm" DOUBLE PRECISION,
ADD COLUMN     "sessionDurationMin" INTEGER,
ADD COLUMN     "weight_kg" DOUBLE PRECISION;
