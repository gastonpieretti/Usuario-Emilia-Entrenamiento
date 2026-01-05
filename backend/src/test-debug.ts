import { getUserById } from './services/userService';
import { prisma } from './lib/prisma';

async function test() {
    try {
        console.log('Testing getUserById with ID 1...');
        // Find any user id first
        const anyUser = await prisma.user.findFirst();
        if (!anyUser) {
            console.log('No users found to test.');
            return;
        }
        const user = await getUserById(anyUser.id);
        console.log('User found:', user);
    } catch (err: any) {
        console.error('Test failed with error:', err.message);
    }
}

test().finally(() => prisma.$disconnect());
