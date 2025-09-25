import { CHAT_SERVER_URL } from './api';

class ChatService {
    constructor() {
        this.webSocket = null;
        this.listeners = {
            onMessage: [],
            onConnect: [],
            onDisconnect: [],
            onError: []
        };
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            try {
                // Формируем WebSocket URL через Gateway
                const socketUrl = `${CHAT_SERVER_URL.replace('http', 'ws')}/ws/chat?token=${token}`;
                console.log('Connecting to WebSocket:', socketUrl);

                this.webSocket = new WebSocket(socketUrl);

                this.webSocket.onopen = () => {
                    console.log('WebSocket connection established');
                    this.reconnectAttempts = 0; // Сброс счетчика переподключений
                    this.listeners.onConnect.forEach(callback => callback());
                    resolve();
                };

                this.webSocket.onmessage = (event) => {
                    try {
                        const parsedMessage = JSON.parse(event.data);
                        console.log('Received message:', parsedMessage);
                        this.listeners.onMessage.forEach(callback => callback(parsedMessage));
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };

                this.webSocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.listeners.onError.forEach(callback => callback(error));
                    reject(error);
                };

                this.webSocket.onclose = (event) => {
                    console.log('WebSocket connection closed', event);
                    this.listeners.onDisconnect.forEach(callback => callback());

                    // Автоматическое переподключение при неожиданном закрытии
                    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                        setTimeout(() => {
                            console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                            this.reconnectAttempts++;
                            this.connect(token);
                        }, this.reconnectDelay);
                    }
                };

            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.close(1000, 'Client disconnect');
            this.webSocket = null;
        }
    }

    sendMessage(message) {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    // Методы для подписки на события
    onMessage(callback) {
        this.listeners.onMessage.push(callback);
    }

    onConnect(callback) {
        this.listeners.onConnect.push(callback);
    }

    onDisconnect(callback) {
        this.listeners.onDisconnect.push(callback);
    }

    onError(callback) {
        this.listeners.onError.push(callback);
    }

    // Проверка состояния соединения
    isConnected() {
        return this.webSocket && this.webSocket.readyState === WebSocket.OPEN;
    }
}

export default new ChatService();
