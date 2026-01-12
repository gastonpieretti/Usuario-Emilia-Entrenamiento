const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testSchema() {
    try {
        console.log('Testing database schema...\n');

        // Test 1: Query a user with planType
        console.log('Test 1: Querying user with planType field...');
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                planType: true,
                name: true,
            }
        });

        if (user) {
            console.log('✓ Success! User query with planType works:');
            console.log(user);
        } else {
            console.log('⚠ No users found in database');
        }

        // Test 2: Query UserProfile with new fields
        console.log('\nTest 2: Querying UserProfile with new onboarding fields...');
        const profile = await prisma.userProfile.findFirst({
            select: {
                id: true,
                userId: true,
                painTobillos: true,
                painCadera: true,
                sleepQuality: true,
                stressLevel: true,
                happyFood: true,
                dailyActivity: true,
            }
        });

        if (profile) {
            console.log('✓ Success! UserProfile query with new fields works:');
            console.log(profile);
        } else {
            console.log('⚠ No user profiles found in database');
        }

        console.log('\n✅ All schema tests passed! The database is ready.');
    } catch (error) {
        console.error('❌ Schema test failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testSchema();
