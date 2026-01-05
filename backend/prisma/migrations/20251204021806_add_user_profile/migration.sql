-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dob" TIMESTAMP(3),
    "city" TEXT,
    "country" TEXT,
    "whatsapp" TEXT,
    "occupation" TEXT,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "measurements" TEXT,
    "injuries" TEXT,
    "painAreas" TEXT[],
    "photos" TEXT[],
    "energyLevel" TEXT,
    "medicalIndication" TEXT,
    "goal" TEXT,
    "experienceLevel" TEXT,
    "lastTrained" TEXT,
    "prevTrainingType" TEXT,
    "trainingLocation" TEXT,
    "equipment" TEXT[],
    "daysPerWeek" INTEGER,
    "timePerDay" TEXT,
    "intensity" TEXT,
    "cardioPreference" TEXT,
    "focusAreas" TEXT[],
    "avoidAreas" TEXT,
    "concreteGoal" TEXT,
    "breakfast" TEXT,
    "mealsPerDay" INTEGER,
    "dislikedFood" TEXT,
    "mustIncludeFood" TEXT,
    "foodAnxiety" TEXT,
    "hungerPeak" TEXT,
    "calmEating" BOOLEAN,
    "fixedSchedule" BOOLEAN,
    "digestiveIssues" TEXT[],
    "dietPreference" TEXT,
    "drinks" TEXT[],
    "waterIntake" TEXT,
    "cookingTime" TEXT,
    "prevPlans" BOOLEAN,
    "abandonmentCauses" TEXT[],
    "emotionalGoal" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
