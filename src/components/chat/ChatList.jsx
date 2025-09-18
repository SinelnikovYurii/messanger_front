import React from 'react';
import './css/ChatList.css';

const ChatList = ({ chats, onSelectChat, selectedChatId }) => {
    return (
        <div className="chat-list">
            <h3>Чаты</h3>
            {chats.map(chat => (
                <div
                    key={chat.id}
                    className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
                    onClick={() => onSelectChat(chat)}
                >
                    <div className="chat-item-info">
                        <div className="chat-item-name">
                            {chat.name || chat.participants.join(', ')}
                        </div>
                        {chat.lastMessage && (
                            <div className="chat-item-preview">
                                {chat.lastMessage.content}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatList;