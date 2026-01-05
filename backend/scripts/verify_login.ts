import axios from 'axios';

const API_URL = 'http://localhost:3001'; // Backend 'index.ts' exposes /auth directly, not /api/auth
const CREDENTIALS = {
    email: 'gastonpieretti@gmail.com',
    password: 'Miami323'
};

async function verifyLogin() {
    console.log('--- START LOGIN VERIFICATION ---');
    console.log(`Target: ${API_URL}/auth/login`);
    console.log(`Creds: ${CREDENTIALS.email} / ${CREDENTIALS.password}`);

    try {
        const response = await axios.post(`${API_URL}/auth/login`, CREDENTIALS);
        console.log('SUCCESS: Login successful!');
        console.log('Token received:', response.data.token ? 'YES' : 'NO');
        console.log('User Role:', response.data.user?.role);
    } catch (error: any) {
        console.log('FAILED: Login failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        process.exit(1); // Force failure exit code
    }
    console.log('--- END VERIFICATION ---');
}

verifyLogin();
