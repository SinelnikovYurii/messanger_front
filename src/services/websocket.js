import { io } from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io('http://localhost:8082', { // WebSocket сервер
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        this.socket.on('message', (data) => {
            this.emit('message', data);
        });

        this.socket.on('messageStatus', (data) => {
            this.emit('messageStatus', data);
        });

        this.socket.on('typing', (data) => {
            this.emit('typing', data);
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sendMessage(chatId, content) {
        if (this.socket) {
            this.socket.emit('sendMessage', {
                chatId,
                content,
                timestamp: new Date().toISOString()
            });
        }
    }

    joinChat(chatId) {
        if (this.socket) {
            this.socket.emit('joinChat', { chatId });
        }
    }

    leaveChat(chatId) {
        if (this.socket) {
            this.socket.emit('leaveChat', { chatId });
        }
    }

    typing(chatId) {
        if (this.socket) {
            this.socket.emit('typing', { chatId });
        }
    }

    // Event emitter methods
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new WebSocketService();