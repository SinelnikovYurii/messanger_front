import { getToken } from './auth';

export const createWebSocket = (chatId) => {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    // Подключаемся через API Gateway, передавая токен в query-параметрах
    return new WebSocket(`ws://localhost:8080/ws/messages?token=${token}`);
};

export const handleWebSocketMessages = (websocket, onMessage, onError, onOpen) => {
    websocket.onopen = () => {
        console.log('WebSocket connection established');
        if (onOpen) onOpen();
    };

    websocket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (onMessage) onMessage(message);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            if (onError) onError(error);
        }
    };

    websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
    };

    websocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
    };
};

export const sendWebSocketMessage = (websocket, message) => {
    if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not open. Ready state:', websocket.readyState);
    }
};
