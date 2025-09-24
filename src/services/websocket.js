import { getToken } from './auth';

export const createWebSocket = (chatId) => {
    const token = getToken(); // Получаем JWT токен
    return new WebSocket(`ws://localhost:8080/ws?chatId=${chatId}&token=${token}`);
};

// Альтернативный вариант с передачей токена в заголовках
export const createWebSocketWithHeaders = (chatId) => {
    const token = getToken();
    return new WebSocket(`ws://localhost:8080/ws?chatId=${chatId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};