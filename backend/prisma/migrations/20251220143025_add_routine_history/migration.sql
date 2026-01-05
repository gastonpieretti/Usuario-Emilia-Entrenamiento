-- CreateTable
CREATE TABLE "RoutineHistory" (
    "id" SERIAL NOT NULL,
    "routineId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "changeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoutineHistory" ADD CONSTRAINT "RoutineHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
