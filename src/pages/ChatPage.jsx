import React from 'react';
import ChatWindow from '../components/ChatWindow';
import UserList from '../components/UserList';

const ChatPage = () => {
    return (
        <div className="flex h-screen">
            <UserList />
            <div className="flex-1">
                <ChatWindow />
            </div>
        </div>
    );
};

export default ChatPage;