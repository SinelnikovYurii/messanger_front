import { CHAT_SERVER_URL } from './api';

class ChatService {
    constructor() {
        this.socket = null;
        this.listeners = {
            onMessage: [],
            onConnect: [],
            onDisconnect: [],
            onError: []
        };
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            try {
                // Используем правильный порт 8091 для WebSocket
                this.socket = new WebSocket(`${CHAT_SERVER_URL.replace('http', 'ws')}/chat?token=${token}`);

                this.socket.onopen = () => {
                    this.listeners.onConnect.forEach(callback => callback());
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.listeners.onMessage.forEach(callback => callback(message));
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };

                this.socket.onclose = () => {
                    this.listeners.onDisconnect.forEach(callback => callback());
                };

                this.socket.onerror = (error) => {
                    this.listeners.onError.forEach(callback => callback(error));
                    reject(error);
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    // Подписка на события
    onMessage(callback) {
        this.listeners.onMessage.push(callback);
        return () => {
            this.listeners.onMessage = this.listeners.onMessage.filter(cb => cb !== callback);
        };
    }

    onConnect(callback) {
        this.listeners.onConnect.push(callback);
        return () => {
            this.listeners.onConnect = this.listeners.onConnect.filter(cb => cb !== callback);
        };
    }

    onDisconnect(callback) {
        this.listeners.onDisconnect.push(callback);
        return () => {
            this.listeners.onDisconnect = this.listeners.onDisconnect.filter(cb => cb !== callback);
        };
    }

    onError(callback) {
        this.listeners.onError.push(callback);
        return () => {
            this.listeners.onError = this.listeners.onError.filter(cb => cb !== callback);
        };
    }
}

export const chatService = new ChatService();