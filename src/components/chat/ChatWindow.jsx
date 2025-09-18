import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import './css/ChatWindow.css';

const ChatWindow = ({ chat, messages, onSendMessage, currentUser }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim() && onSendMessage) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!chat) {
        return (
            <div className="chat-window-placeholder">
                Выберите чат для начала общения
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>{chat.name || chat.participants.join(', ')}</h3>
            </div>

            <div className="messages-container">
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        isOwnMessage={message.senderId === currentUser?.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
        <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            rows="1"
        />
                <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="send-button"
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;