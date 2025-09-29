import React from 'react';
import ChatWindow from '../components/ChatWindow';
import UserList from '../components/UserList';
import Navigation from '../components/Navigation';

const ChatPage = () => {
    return (
        <div className="flex flex-col h-screen">
            <Navigation />
            <div className="flex flex-1">
                <UserList />
                <div className="flex-1">
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;