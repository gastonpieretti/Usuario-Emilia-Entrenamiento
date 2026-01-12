-- Add missing columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "planType" TEXT DEFAULT 'COMPLETO';

-- Add missing columns to UserProfile table
ALTER TABLE "UserProfile" 
ADD COLUMN IF NOT EXISTS "painTobillos" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "painCadera" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "sleepQuality" TEXT,
ADD COLUMN IF NOT EXISTS "stressLevel" TEXT,
ADD COLUMN IF NOT EXISTS "happyFood" TEXT,
ADD COLUMN IF NOT EXISTS "dailyActivity" TEXT;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'planType';

SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'UserProfile' 
AND column_name IN ('painTobillos', 'painCadera', 'sleepQuality', 'stressLevel', 'happyFood', 'dailyActivity');
