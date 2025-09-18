let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function initWebSocket(onMessage) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No token available for WebSocket connection');
        return;
    }

    try {
        socket = new WebSocket(`ws://localhost:8080?token=${token}`);

        socket.onopen = () => {
            console.log('WebSocket connected');
            reconnectAttempts = 0;
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                onMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            attemptReconnect(onMessage);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

    } catch (error) {
        console.error('WebSocket connection failed:', error);
    }
}

function attemptReconnect(onMessage) {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * reconnectAttempts, 5000);

        console.log(`Attempting to reconnect in ${delay}ms...`);

        setTimeout(() => {
            initWebSocket(onMessage);
        }, delay);
    }
}

export function sendWebSocketMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        return true;
    }
    return false;
}

export function closeWebSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
}