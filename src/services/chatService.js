import api from './api';

class ChatService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.messageHandlers = [];
        this.connectionHandlers = [];
        this.chatEventHandlers = []; // Добавляем обработчики событий чата
        this.isAuthenticated = false;
        this.currentToken = null;
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            this.currentToken = token;
            this.isAuthenticated = false;

            // Подключаемся через Gateway на порту 8083
            const wsUrl = `ws://localhost:8083/ws/chat?token=${token}`;
            console.log('Connecting to WebSocket:', wsUrl);

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connected successfully');
                this.isAuthenticated = true;
                this.reconnectAttempts = 0;
                this.connectionHandlers.forEach(handler => {
                    if (handler.onConnect) handler.onConnect();
                });
                resolve(); // Сразу резолвим при успешном подключении
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Received WebSocket message:', message);

                    // Обрабатываем различные типы сообщений
                    if (message.type === 'AUTH_SUCCESS') {
                        console.log('Authentication confirmed:', message);
                        return; // Не передаем дальше
                    } else if (message.type === 'SYSTEM_MESSAGE') {
                        console.log('System message:', message.content);
                        return; // Не передаем дальше
                    } else if (message.type === 'MESSAGE_SENT') {
                        console.log('Message sent confirmation:', message.content);
                        return; // Не передаем дальше - это только подтверждение
                    } else if (message.type === 'PONG') {
                        console.log('Received pong');
                        return; // Не передаем дальше
                    } else if (message.type === 'ERROR') {
                        console.error('WebSocket error:', message.content);
                        this.connectionHandlers.forEach(handler => {
                            if (handler.onError) handler.onError(new Error(message.content));
                        });
                        return;
                    } else if (message.type === 'CHAT_EVENT') {
                        // Обрабатываем события чата, отправленные через Kafka
                        console.log('Chat event received:', message);
                        this.chatEventHandlers.forEach(handler => handler(message));
                        return;
                    }

                    // Передаем только значимые сообщения обработчикам
                    if (message.type === 'CHAT_MESSAGE' || message.type === 'MESSAGE') {
                        this.messageHandlers.forEach(handler => handler(message));
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    // Если не JSON, то передаем как текст
                    const textMessage = {
                        type: 'TEXT',
                        content: event.data,
                        timestamp: new Date().toISOString()
                    };
                    this.messageHandlers.forEach(handler => handler(textMessage));
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connectionHandlers.forEach(handler => {
                    if (handler.onError) handler.onError(error);
                });
                if (!this.isAuthenticated) {
                    reject(error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket connection closed', event);
                this.isAuthenticated = false;
                this.connectionHandlers.forEach(handler => {
                    if (handler.onClose) handler.onClose(event);
                });

                // Автоматическое переподключение только если была успешная аутентификация
                if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentToken) {
                    this.reconnectAttempts++;
                    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    setTimeout(() => {
                        this.connect(this.currentToken).catch(() => {});
                    }, this.reconnectInterval);
                }
            };

            // Таймаут на случай если соединение зависнет
            setTimeout(() => {
                if (!this.isAuthenticated && this.socket && this.socket.readyState !== WebSocket.OPEN) {
                    console.error('WebSocket connection timeout');
                    reject(new Error('Connection timeout'));
                }
            }, 5000);
        });
    }

    disconnect() {
        this.currentToken = null;
        this.isAuthenticated = false;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    sendWebSocketMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.isAuthenticated) {
            this.socket.send(JSON.stringify(message));
            return true;
        } else {
            console.error('WebSocket is not connected or not authenticated');
            console.log('Socket state:', {
                exists: !!this.socket,
                readyState: this.socket?.readyState,
                isAuthenticated: this.isAuthenticated,
                readyStateText: this.getReadyStateText()
            });
            return false;
        }
    }

    getReadyStateText() {
        if (!this.socket) return 'No socket';
        switch (this.socket.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }

    sendChatMessage(content, chatId) {
        const message = {
            type: 'CHAT_MESSAGE',
            content: content,
            chatId: chatId,
            timestamp: new Date().toISOString()
        };
        const sent = this.sendWebSocketMessage(message);
        if (!sent) {
            throw new Error('Не удалось отправить сообщение: WebSocket не подключен');
        }
    }

    ping() {
        const message = {
            type: 'PING'
        };
        this.sendWebSocketMessage(message);
    }

    onMessage(handler) {
        this.messageHandlers.push(handler);
        // Возвращаем функцию для отписки
        return () => {
            this.removeMessageHandler(handler);
        };
    }

    onConnection(handlers) {
        this.connectionHandlers.push(handlers);
    }

    // Добавляем обработчик событий чата
    onChatEvent(handler) {
        this.chatEventHandlers.push(handler);
        // Возвращаем функцию для отписки
        return () => {
            this.removeChatEventHandler(handler);
        };
    }

    removeMessageHandler(handler) {
        const index = this.messageHandlers.indexOf(handler);
        if (index > -1) {
            this.messageHandlers.splice(index, 1);
        }
    }

    removeConnectionHandler(handler) {
        const index = this.connectionHandlers.indexOf(handler);
        if (index > -1) {
            this.connectionHandlers.splice(index, 1);
        }
    }

    removeChatEventHandler(handler) {
        const index = this.chatEventHandlers.indexOf(handler);
        if (index > -1) {
            this.chatEventHandlers.splice(index, 1);
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    // API методы для работы с чатами
    async getUserChats() {
        const response = await api.get('/api/chats');
        return response.data;
    }

    async createPrivateChat(participantId) {
        const response = await api.post('/api/chats/private', {
            participantId
        });
        return response.data;
    }

    async createGroupChat(chatData) {
        const response = await api.post('/api/chats/group', {
            chatName: chatData.chatName,
            chatType: 'GROUP',
            chatDescription: chatData.chatDescription,
            participantIds: chatData.participantIds
        });
        return response.data;
    }

    async addParticipants(chatId, userIds) {
        const response = await api.post(`/api/chats/${chatId}/participants`, userIds);
        return response.data;
    }

    async leaveChat(chatId) {
        const response = await api.delete(`/api/chats/${chatId}/leave`);
        return response.data;
    }

    async getChatInfo(chatId) {
        const response = await api.get(`/api/chats/${chatId}`);
        return response.data;
    }

    async searchChats(query) {
        const response = await api.get(`/api/chats/search?query=${encodeURIComponent(query)}`);
        return response.data;
    }

    async getChatMessages(chatId, page = 0, size = 50) {
        const response = await api.get(`/api/messages/chat/${chatId}?page=${page}&size=${size}`);
        return response.data;
    }

    async editMessage(messageId, content) {
        const response = await api.put(`/api/messages/${messageId}`, {
            messageId,
            content
        });
        return response.data;
    }

    async deleteMessage(messageId) {
        const response = await api.delete(`/api/messages/${messageId}`);
        return response.data;
    }

    async searchMessages(chatId, query, page = 0, size = 20) {
        const response = await api.get(`/api/messages/chat/${chatId}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
        return response.data;
    }
}

// Создаем единственный экземпляр сервиса
const chatService = new ChatService();

// Экспортируем и класс, и экземпляр
export { ChatService };
export default chatService;
