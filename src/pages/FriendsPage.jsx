import React from 'react';
import FriendsManager from '../components/FriendsManager';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';

const FriendsPage = () => {
  const navigate = useNavigate();

  const handleStartChat = async (user) => {
    try {
      // Создаем приватный чат с пользователем
      const chat = await chatService.createPrivateChat(user.id);
      // Переходим на страницу чата
      navigate('/chat', {
        state: {
          selectedChat: chat,
          user: user
        }
      });
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex-1 bg-gray-50 overflow-auto">
        <FriendsManager onStartChat={handleStartChat} />
      </div>
    </div>
  );
};

export default FriendsPage;
