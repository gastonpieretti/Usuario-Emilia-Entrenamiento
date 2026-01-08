-- AlterTable
ALTER TABLE "User" ADD COLUMN     "planStartDate" TIMESTAMP(3),
ADD COLUMN     "acquiredMonths" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "planSchedule" JSONB;
