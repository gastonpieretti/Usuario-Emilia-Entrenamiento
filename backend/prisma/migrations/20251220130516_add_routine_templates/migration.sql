/*
  Warnings:

  - You are about to drop the column `description` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `equipment` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `injuriesToAvoid` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `muscleGroup` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Exercise` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "description",
DROP COLUMN "difficulty",
DROP COLUMN "equipment",
DROP COLUMN "injuriesToAvoid",
DROP COLUMN "muscleGroup",
DROP COLUMN "name",
DROP COLUMN "videoUrl",
ADD COLUMN     "categoria" TEXT NOT NULL,
ADD COLUMN     "idVariante" INTEGER,
ADD COLUMN     "instruccionesTecnicas" TEXT,
ADD COLUMN     "nivel" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "repsSugeridas" TEXT,
ADD COLUMN     "seriesSugeridas" INTEGER,
ADD COLUMN     "urlVideoLoop" TEXT;

-- CreateTable
CREATE TABLE "RoutineTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateExercise" (
    "id" SERIAL NOT NULL,
    "routineTemplateId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "restTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TemplateExercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemplateExercise" ADD CONSTRAINT "TemplateExercise_routineTemplateId_fkey" FOREIGN KEY ("routineTemplateId") REFERENCES "RoutineTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateExercise" ADD CONSTRAINT "TemplateExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
