/*
  Warnings:

  - You are about to drop the column `abandonmentCauses` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `avoidAreas` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `breakfast` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `calmEating` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `cardioPreference` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `concreteGoal` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `cookingTime` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `digestiveIssues` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dob` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `drinks` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `emotionalGoal` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `fixedSchedule` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `focusAreas` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `foodAnxiety` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `hungerPeak` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `intensity` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastTrained` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `medicalIndication` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mustIncludeFood` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `painAreas` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `prevPlans` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `prevTrainingType` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `timePerDay` on the `UserProfile` table. All the data in the column will be lost.
  - Made the column `instruccionesTecnicas` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `repsSugeridas` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `seriesSugeridas` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `urlVideoLoop` on table `Exercise` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "instruccionesTecnicas" SET NOT NULL,
ALTER COLUMN "repsSugeridas" SET NOT NULL,
ALTER COLUMN "seriesSugeridas" SET NOT NULL,
ALTER COLUMN "urlVideoLoop" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "abandonmentCauses",
DROP COLUMN "avoidAreas",
DROP COLUMN "breakfast",
DROP COLUMN "calmEating",
DROP COLUMN "cardioPreference",
DROP COLUMN "comments",
DROP COLUMN "concreteGoal",
DROP COLUMN "cookingTime",
DROP COLUMN "digestiveIssues",
DROP COLUMN "dob",
DROP COLUMN "drinks",
DROP COLUMN "emotionalGoal",
DROP COLUMN "fixedSchedule",
DROP COLUMN "focusAreas",
DROP COLUMN "foodAnxiety",
DROP COLUMN "hungerPeak",
DROP COLUMN "intensity",
DROP COLUMN "lastTrained",
DROP COLUMN "medicalIndication",
DROP COLUMN "mustIncludeFood",
DROP COLUMN "painAreas",
DROP COLUMN "photos",
DROP COLUMN "prevPlans",
DROP COLUMN "prevTrainingType",
DROP COLUMN "timePerDay",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "painColumna" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "painHombro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "painRodilla" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sessionDuration" INTEGER;

-- AddForeignKey
ALTER TABLE "RoutineHistory" ADD CONSTRAINT "RoutineHistory_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
