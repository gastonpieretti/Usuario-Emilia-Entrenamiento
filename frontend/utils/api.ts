import axios from 'axios';

const api = axios.create({
    // Asegúrate de que esta URL en Render termine sin la barra final "/"
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Interceptor para adjuntar el token de seguridad en cada petición
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para detectar si el token expiró y avisar al usuario
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Sesión inválida o expirada');
            // Opcional: localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
