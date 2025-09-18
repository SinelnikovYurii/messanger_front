import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../hooks/useAuth.jsx';
import { useChat } from '../hooks/useChat';
import './ChatPage.css';

const ChatPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);

    const {
        chats,
        messages,
        loadChats,
        loadMessages,
        sendMessage
    } = useChat();

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat.id);
        }
    }, [selectedChat]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleSendMessage = (content) => {
        if (selectedChat) {
            sendMessage(selectedChat.id, content);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="chat-page">
            <div className="chat-layout">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h2>Мессенджер</h2>
                        <button onClick={handleLogout} className="logout-button">
                            Выйти
                        </button>
                    </div>
                    <ChatList
                        chats={chats}
                        onSelectChat={handleChatSelect}
                        selectedChatId={selectedChat?.id}
                    />
                </div>

                <div className="main-content">
                    <ChatWindow
                        chat={selectedChat}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUser={user}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;