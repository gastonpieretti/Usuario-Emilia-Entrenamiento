import axios from 'axios';

const API_URL = 'http://localhost:3001';
const USER_ID = 1; // Assuming user 1 exists, or at least the endpoint should respond
const TOKEN = ''; // We might need a token if it's protected. verify_login.ts gets a token.

// We need to login first to get a token
const ADMIN_CREDS = {
    email: 'gastonpieretti@gmail.com',
    password: 'Miami323'
};

async function verifyHistory() {
    console.log('--- START HISTORY VERIFICATION ---');
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDS);
        const token = loginRes.data.token;
        console.log('Login successful, token obtained.');

        // 2. Fetch History
        const historyUrl = `${API_URL}/routines/history/user/${USER_ID}`;
        console.log(`Fetching history from: ${historyUrl}`);

        const historyRes = await axios.get(historyUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('SUCCESS: History fetched!');
        console.log('Count:', historyRes.data.length);
    } catch (error: any) {
        console.log('FAILED: Fetch failed');
        if (error.response?.data?.error) {
            console.log('Server Error:', error.response.data.error);
        } else {
            console.log('Message:', error.message);
        }
    }
    console.log('--- END VERIFICATION ---');
}

verifyHistory();
