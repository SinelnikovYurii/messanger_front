import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import chatService from '../services/chatService';
import authService from '../services/authService';
import EnhancedChatWindow from '../components/EnhancedChatWindow';
import UserSearchModal from '../components/UserSearchModal';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import FriendsManager from '../components/FriendsManager';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [loading, setLoading] = useState(true);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const logout_icon = 'logout.png';
  const profile_icon = 'profile.png';
  const group_icon = 'group.png';

  // Инициализация WebSocket соединения
  useEffect(() => {
    const initializeWebSocket = async () => {
      if (!token) {
        console.log('No token available for WebSocket connection');
        return;
      }

      try {
        console.log('Initializing WebSocket connection...');
        await chatService.connect(token);
        setIsWebSocketConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected successfully');
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setIsWebSocketConnected(false);
        setConnectionError('Ошибка подключения к серверу сообщений');
      }
    };

    // Обработчики WebSocket соединения
    const connectionHandlers = {
      onConnect: () => {
        console.log('WebSocket reconnected');
        setIsWebSocketConnected(true);
        setConnectionError(null);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setIsWebSocketConnected(false);
        setConnectionError('Ошибка соединения с сервером');
      },
      onClose: (event) => {
        console.log('WebSocket connection closed', event);
        setIsWebSocketConnected(false);
        if (event.code !== 1000) {
          setConnectionError('Соединение потеряно, переподключение...');
        }
      }
    };

    chatService.onConnection(connectionHandlers);

    // Инициализируем WebSocket
    initializeWebSocket();

    // Очистка при размонтировании
    return () => {
      console.log('Cleaning up WebSocket connection');
      chatService.removeConnectionHandler(connectionHandlers);
      chatService.disconnect();
      setIsWebSocketConnected(false);
    };
  }, [token]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const userChats = await chatService.getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (chatOrUser) => {
    if (chatOrUser.chatType) {
      // Это чат
      setSelectedChat(chatOrUser);
      if (!chats.find(c => c.id === chatOrUser.id)) {
        setChats([chatOrUser, ...chats]);
      }
    } else {
      // Это пользователь, создаем приватный чат
      // Логика уже обработана в UserSearchModal
    }
  };

  const handleChatCreated = (newChat) => {
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
  };

  const handleChatUpdate = (updatedChat) => {
    if (updatedChat === null) {
      // Пользователь покинул чат
      setChats(chats.filter(c => c.id !== selectedChat.id));
      setSelectedChat(null);
    } else {
      // Чат обновлен
      setChats(chats.map(c => c.id === updatedChat.id ? updatedChat : c));
      setSelectedChat(updatedChat);
    }
  };

  const formatLastMessage = (chat) => {
    if (!chat.lastMessage) return 'Нет сообщений';

    const message = chat.lastMessage;
    if (message.messageType === 'SYSTEM') {
      return message.content;
    }

    const senderName = message.sender?.username || 'Неизвестный';
    const content = message.content.length > 30
      ? message.content.substring(0, 30) + '...'
      : message.content;

    return `${senderName}: ${content}`;
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };

  const getChatTitle = (chat) => {
    if (chat.chatType === 'GROUP') {
      return chat.chatName || 'Групповой чат';
    } else {
      // Для приватного чата показываем имя собеседника
      const otherParticipant = chat.participants?.find(p => p.id !== user?.id);
      return otherParticipant ? otherParticipant.username : 'Приватный чат';
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    // Дополнительная логика выхода, если необходима
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Боковая панель */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                {user?.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  {user?.username || 'Пользователь'}
                </h1>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isWebSocketConnected ? 'В сети' : 'Подключение...'}
                  </span>
                  {connectionError && (
                    <span className="text-xs text-red-500 ml-2">({connectionError})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {}}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
                title="Настройки профиля"
              >
                <img src={profile_icon} alt="" className="w-5 h-5 opacity-90 group-hover:opacity-100" draggable="false" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
                title="Выйти"
              >
                <img src={logout_icon} alt="" className="w-5 h-5 opacity-90 group-hover:opacity-100" draggable="false" />
              </button>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'chats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Чаты
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'friends'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Друзья
          </button>
        </div>

        {/* Кнопки действий */}
        <div className="p-4 border-b border-gray-200 space-y-2">
          <button
            onClick={() => setShowUserSearch(true)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Найти пользователя
          </button>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Создать групповой чат
          </button>
        </div>

        {/* Содержимое в зависимости от активного таба */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' && (
            <>
              {loading && (
                <div className="p-4 text-center text-gray-500">
                  Загрузка чатов...
                </div>
              )}

              {!loading && chats.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <div className="mb-2">У вас пока нет чатов</div>
                  <div className="text-sm">Найдите пользователей для начала общения</div>
                </div>
              )}

              {!loading && chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      {chat.chatAvatarUrl ? (
                        <img
                          src={chat.chatAvatarUrl}
                          alt={getChatTitle(chat)}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {chat.chatType === 'GROUP' ? <img src={group_icon} alt="" className="w-5 h-5 opacity-90 group-hover:opacity-100" draggable="false" /> : getChatTitle(chat).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-gray-900 truncate">
                          {getChatTitle(chat)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatLastMessageTime(chat.lastMessageAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {formatLastMessage(chat)}
                      </div>
                      {chat.chatType === 'GROUP' && (
                        <div className="text-xs text-gray-400">
                          {chat.participants?.length || 0} участников
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'friends' && (
            <FriendsManager />
          )}
        </div>
      </div>

      {/* Основная область чата */}
      <EnhancedChatWindow
        selectedChat={selectedChat}
        onChatUpdate={handleChatUpdate}
      />

      {/* Модальные окна */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleUserSelect}
        mode="single"
      />

      <CreateGroupChatModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default ChatPage;
