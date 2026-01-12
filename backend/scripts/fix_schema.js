const { Client } = require('pg');
require('dotenv').config();

async function fixSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✓ Connected to database');

        // Add missing columns
        const migrations = [
            `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planType" TEXT DEFAULT 'COMPLETO';`,
            `ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "painTobillos" BOOLEAN DEFAULT false;`,
            `ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "painCadera" BOOLEAN DEFAULT false;`,
            `ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "sleepQuality" TEXT;`,
            `ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "stressLevel" TEXT;`,
            `ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "happyFood" TEXT;`,
            `ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "dailyActivity" TEXT;`,
        ];

        for (const sql of migrations) {
            console.log(`Executing: ${sql}`);
            await client.query(sql);
            console.log('✓ Success');
        }

        // Verify the changes
        console.log('\n--- Verifying User.planType ---');
        const userCheck = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'planType';
    `);
        console.log(userCheck.rows);

        console.log('\n--- Verifying UserProfile columns ---');
        const profileCheck = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'UserProfile' 
      AND column_name IN ('painTobillos', 'painCadera', 'sleepQuality', 'stressLevel', 'happyFood', 'dailyActivity')
      ORDER BY column_name;
    `);
        console.log(profileCheck.rows);

        console.log('\n✅ Schema migration completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixSchema();
