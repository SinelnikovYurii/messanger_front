class ChatService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.messageHandlers = [];
        this.connectionHandlers = [];
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            // Подключаемся через Gateway на порту 8083
            const wsUrl = `ws://localhost:8083/ws/chat?token=${token}`;
            console.log('Connecting to WebSocket:', wsUrl);

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connected successfully');
                this.reconnectAttempts = 0;
                this.connectionHandlers.forEach(handler => {
                    if (handler.onConnect) handler.onConnect();
                });
                resolve();
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Received message:', message);
                    this.messageHandlers.forEach(handler => handler(message));
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connectionHandlers.forEach(handler => {
                    if (handler.onError) handler.onError(error);
                });
                reject(error);
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket connection closed', event);
                this.connectionHandlers.forEach(handler => {
                    if (handler.onClose) handler.onClose(event);
                });

                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    setTimeout(() => {
                        this.connect(token).catch(() => {});
                    }, this.reconnectInterval);
                }
            };
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
        } else {
            console.error('WebSocket is not connected');
        }
    }

    onMessage(handler) {
        this.messageHandlers.push(handler);
    }

    onConnection(handlers) {
        this.connectionHandlers.push(handlers);
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

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

// Создаем единственный экземпляр сервиса
const chatService = new ChatService();

// Экспортируем и класс, и экземпляр
export { ChatService, chatService };
export default chatService;
