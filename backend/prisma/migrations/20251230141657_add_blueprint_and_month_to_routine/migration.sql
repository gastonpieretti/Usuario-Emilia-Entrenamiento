-- AlterTable
ALTER TABLE "Routine" ADD COLUMN     "blueprint" JSONB,
ADD COLUMN     "month" INTEGER NOT NULL DEFAULT 1;
