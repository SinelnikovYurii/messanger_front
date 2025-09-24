import axios from 'axios';

const AUTH_SERVER_URL = 'http://localhost:8081'; // Authorization Server - ПОРТ 8081
const API_GATEWAY_URL = 'http://localhost:8080'; // API Gateway - ПОРТ 8080
const CHAT_SERVER_URL = 'http://localhost:8091'; // Chat Server - ПОРТ 8091

// Auth API - теперь указывает на Authorization Server (8081)
export const authApi = axios.create({
    baseURL: `${AUTH_SERVER_URL}/auth`,
    withCredentials: true,
});

// User API - указывает на API Gateway (8080)
export const userApi = axios.create({
    baseURL: `${API_GATEWAY_URL}/api/users`,
    withCredentials: true,
});

// Настройка интерцепторов для автоматической установки токенов
authApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { AUTH_SERVER_URL, API_GATEWAY_URL, CHAT_SERVER_URL };