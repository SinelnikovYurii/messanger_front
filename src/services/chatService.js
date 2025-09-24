import { CHAT_SERVER_URL } from './api';
import { Client } from '@stomp/stompjs';

class ChatService {
    constructor() {
        this.stompClient = null;
        this.token = null;
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
                this.stompClient = new Client({
                    brokerURL: `${CHAT_SERVER_URL.replace('http', 'ws')}/ws/chat`,
                    connectHeaders: {
                        token: token
                    },
                    onConnect: () => {
                        this.listeners.onConnect.forEach(callback => callback());
                        resolve();

                        // Подписка на сообщения
                        this.stompClient.subscribe('/topic/messages', (message) => {
                            try {
                                const parsedMessage = JSON.parse(message.body);
                                this.listeners.onMessage.forEach(callback => callback(parsedMessage));
                            } catch (error) {
                                console.error('Error parsing message:', error);
                            }
                        });
                    },
                    onStompError: (frame) => {
                        console.error('Broker reported error: ' + frame.headers['message']);
                        this.listeners.onError.forEach(callback => callback(frame));
                        reject(frame);
                    },
                    onWebSocketError: (error) => {
                        console.error('WebSocket error:', error);
                        this.listeners.onError.forEach(callback => callback(error));
                        reject(error);
                    },
                    onDisconnect: () => {
                        this.listeners.onDisconnect.forEach(callback => callback());
                    }
                });

                this.stompClient.activate();
            } catch (error) {
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }

    sendMessage(message) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
                destination: '/app/chat',
                body: JSON.stringify(message)
            });
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