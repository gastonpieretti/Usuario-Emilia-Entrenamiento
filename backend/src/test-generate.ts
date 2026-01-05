import { generateOrchestratedRoutine } from './services/routineOrchestrator';

async function test() {
    try {
        console.log('Testing generation for User 3...');
        const result = await generateOrchestratedRoutine(3);
        console.log('Result:', result);
    } catch (e: any) {
        console.error('Test failed:', e.message);
    }
}

test();
