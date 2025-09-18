import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // API Gateway
const AUTH_SERVICE_URL = 'http://localhost:8081'; // Auth Service

// Создаем экземпляры axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const authClient = axios.create({
    baseURL: AUTH_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для добавления JWT токена
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ошибок
const handleResponse = (response) => response.data;

const handleError = (error) => {
    if (error.response) {
        throw new Error(error.response.data.message || 'Произошла ошибка');
    } else if (error.request) {
        throw new Error('Сервер не отвечает');
    } else {
        throw new Error('Ошибка запроса');
    }
};

// Auth Service API
export const authService = {
    login: (credentials) =>
        authClient.post('/login', credentials).then(handleResponse).catch(handleError),

    register: (userData) =>
        authClient.post('/register', userData).then(handleResponse).catch(handleError),

    refreshToken: (refreshToken) =>
        authClient.post('/refresh', { token: refreshToken }).then(handleResponse).catch(handleError),
};

// Chat API (через API Gateway)
export const chatService = {
    // Чаты
    getChats: () =>
        apiClient.get('/chats').then(handleResponse).catch(handleError),

    createChat: (chatData) =>
        apiClient.post('/chats', chatData).then(handleResponse).catch(handleError),

    getChat: (chatId) =>
        apiClient.get(`/chats/${chatId}`).then(handleResponse).catch(handleError),

    // Сообщения
    getMessages: (chatId) =>
        apiClient.get(`/chats/${chatId}/messages`).then(handleResponse).catch(handleError),

    sendMessage: (chatId, messageData) =>
        apiClient.post(`/chats/${chatId}/messages`, messageData).then(handleResponse).catch(handleError),

    // Участники
    addParticipant: (chatId, userId) =>
        apiClient.post(`/chats/${chatId}/participants`, { userId }).then(handleResponse).catch(handleError),

    removeParticipant: (chatId, userId) =>
        apiClient.delete(`/chats/${chatId}/participants/${userId}`).then(handleResponse).catch(handleError),
};

// User API
export const userService = {
    getProfile: () =>
        apiClient.get('/users/profile').then(handleResponse).catch(handleError),

    updateProfile: (userData) =>
        apiClient.put('/users/profile', userData).then(handleResponse).catch(handleError),

    searchUsers: (query) =>
        apiClient.get(`/users/search?q=${query}`).then(handleResponse).catch(handleError),
};

export default apiClient;