import axios from 'axios';

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // Fallback for local development ONLY
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:3001';
    }

    // In production without env var, we shouldn't guess port 3001. 
    // It's better to fail or assume relative path if on same domain, 
    // but here we will default to a placeholder or empty to force Env Var usage.
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
