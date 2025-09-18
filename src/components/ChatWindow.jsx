import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { chatService } from '../services/chatService';
import { addMessage, setConnected } from '../store/slices/chatSlice';

const ChatWindow = () => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    const { messages, isConnected } = useSelector(state => state.chat);
    const { token } = useSelector(state => state.auth);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (token) {
            // Подключаемся к WebSocket
            chatService.connect(token)
                .then(() => {
                    dispatch(setConnected(true));
                })
                .catch(error => {
                    console.error('Connection error:', error);
                });

            // Подписываемся на сообщения
            const unsubscribe = chatService.onMessage((message) => {
                dispatch(addMessage(message));
            });

            // Очистка при размонтировании
            return () => {
                unsubscribe();
                chatService.disconnect();
                dispatch(setConnected(false));
            };
        }
    }, [token, dispatch]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && isConnected) {
            const message = {
                content: newMessage.trim(),
                timestamp: new Date().toISOString()
            };
            chatService.sendMessage(message);
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm p-4">
                <h1 className="text-xl font-semibold">Chat</h1>
                <div className="flex items-center mt-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-sm">
                                        {message.sender || 'Unknown'}
                                    </div>
                                    <div className="text-gray-800 mt-1">
                                        {message.content}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !isConnected}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;