import axios from 'axios';

// Конфигурация URL серверов
const AUTH_SERVER_URL = 'http://localhost:8081'; // Authorization Server
const API_GATEWAY_URL = 'http://localhost:8080'; // API Gateway

// Временное решение: прямое подключение к WebSocket серверу
// Используйте это если Gateway не работает
export const CHAT_SERVER_URL_DIRECT = 'http://localhost:8092'; // Прямо к WebSocket серверу
export const CHAT_SERVER_URL = 'http://localhost:8080'; // Через Gateway (основной вариант)

// Auth API - напрямую к серверу авторизации
export const authApi = axios.create({
    baseURL: `${AUTH_SERVER_URL}`,
    withCredentials: true,
});

// API через Gateway
export const gatewayApi = axios.create({
    baseURL: `${API_GATEWAY_URL}`,
    withCredentials: true,
});

// User API через Gateway
export const userApi = axios.create({
    baseURL: `${API_GATEWAY_URL}/api/users`,
    withCredentials: true,
});

// Chat API через Gateway
export const chatApi = axios.create({
    baseURL: `${API_GATEWAY_URL}/api/chats`,
    withCredentials: true,
});

// Message API через Gateway
export const messageApi = axios.create({
    baseURL: `${API_GATEWAY_URL}/api/messages`,
    withCredentials: true,
});

// Функции авторизации
export const login = (credentials) => authApi.post('/auth/login', credentials);
export const register = (credentials) => authApi.post('/auth/register', credentials);
export const validateToken = () => authApi.get('/auth/me');

// Настройка интерцепторов для автоматической установки токенов
const setupInterceptors = (apiInstance) => {
    apiInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    apiInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

// Применяем интерцепторы ко всем API клиентам
setupInterceptors(authApi);
setupInterceptors(gatewayApi);
setupInterceptors(userApi);
setupInterceptors(chatApi);
setupInterceptors(messageApi);
