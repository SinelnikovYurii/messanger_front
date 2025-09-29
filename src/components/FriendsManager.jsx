import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import UserSearchModal from './UserSearchModal';

const FriendsManager = ({ onStartChat }) => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем все данные при монтировании компонента
  useEffect(() => {
    loadAllData();
  }, []);

  // Загрузка данных при переключении вкладок
  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  // Загружает данные для всех вкладок одновременно
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [friendsData, incomingData, outgoingData] = await Promise.all([
        userService.getFriends(),
        userService.getIncomingFriendRequests(),
        userService.getOutgoingFriendRequests()
      ]);

      console.log("Данные о друзьях:", friendsData);

      // Подробный вывод структуры входящих запросов
      console.log("Входящие запросы:", incomingData);
      if (incomingData && incomingData.length > 0) {
        console.log("Структура первого входящего запроса (все поля):");
        for (const key in incomingData[0]) {
          console.log(`Поле '${key}':`, incomingData[0][key]);
        }
      }

      console.log("Исходящие запросы:", outgoingData);

      setFriends(friendsData);
      setIncomingRequests(incomingData);
      setOutgoingRequests(outgoingData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError('Не удалось загрузить данные');

      // Проверяем, не связана ли ошибка с авторизацией
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Обработка ошибки авторизации без перенаправления
        console.log('Ошибка авторизации, но не перенаправляем на логин');
      }
    } finally {
      setLoading(false);
    }
  };

  // Загружает данные только для текущей активной вкладки
  const loadTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'friends':
          const friendsData = await userService.getFriends();
          setFriends(friendsData);
          break;
        case 'incoming':
          const incomingData = await userService.getIncomingFriendRequests();
          setIncomingRequests(incomingData);
          break;
        case 'outgoing':
          const outgoingData = await userService.getOutgoingFriendRequests();
          setOutgoingRequests(outgoingData);
          break;
      }
    } catch (error) {
      console.error('Ошибка загрузки данных для вкладки:', error);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriendRequest = async (request) => {
    try {
      // Детальное логирование структуры объекта запроса
      console.log('FriendsManager: Весь объект запроса дружбы (accept):', JSON.stringify(request));

      // Проверяем все возможные поля, которые могут содержать ID запроса дружбы
      const requestId = request.friendshipId || request.requestId || request.friendship_id ||
                       request.friendRequest?.id || request.friendship?.id || request.request?.id ||
                       request.sender_id || request.senderId || request.userId || request.id;

      console.log('FriendsManager: Используемый ID запроса дружбы:', requestId);
      console.log('FriendsManager: Тип ID:', typeof requestId);
      console.log('FriendsManager: Отправляем данные:', JSON.stringify({ requestId, accept: true }));

      // Фиксируем точное время запроса для анализа задержек
      const startTime = Date.now();

      // Вызываем API сервиса с правильным ID
      const response = await userService.respondToFriendRequest(requestId, true);

      // Фиксируем время ответа
      const endTime = Date.now();
      console.log(`FriendsManager: Время запроса: ${endTime - startTime}ms`);

      console.log('FriendsManager: Ответ сервера:', response);

      await loadAllData(); // Обновляем все данные после принятия запроса
      setError(null);
    } catch (error) {
      console.error('FriendsManager: Детали ошибки принятия запроса:', error);
      if (error.response) {
        console.error('FriendsManager: Статус ошибки:', error.response.status);
        console.error('FriendsManager: Данные ошибки:', error.response.data);
      }
      setError('Не удалось принять запрос дружбы. Возможно, запрос был удален или уже обработан.');
    }
  };

  const handleRejectFriendRequest = async (request) => {
    try {
      // Детальное логирование структуры объекта запроса
      console.log('FriendsManager: Весь объект запроса дружбы (reject):', JSON.stringify(request));

      // Проверяем все возможные поля, которые могут содержать ID запроса дружбы
      const requestId = request.friendshipId || request.requestId || request.friendship_id ||
                       request.friendRequest?.id || request.friendship?.id || request.request?.id ||
                       request.sender_id || request.senderId || request.userId || request.id;

      console.log('FriendsManager: Используемый ID для отклонения запроса дружбы:', requestId);
      console.log('FriendsManager: Тип ID:', typeof requestId);
      console.log('FriendsManager: Отправляем данные для отклонения:', JSON.stringify({ requestId, accept: false }));

      // Фиксируем точное время запроса для анализа задержек
      const startTime = Date.now();

      // Вызываем API сервиса с правильным ID
      const response = await userService.respondToFriendRequest(requestId, false);

      // Фиксируем время ответа
      const endTime = Date.now();
      console.log(`FriendsManager: Время запроса: ${endTime - startTime}ms`);

      console.log('FriendsManager: Ответ сервера при отклонении:', response);

      await loadAllData(); // Обновляем все данные
      setError(null);
    } catch (error) {
      console.error('FriendsManager: Детали ошибки отклонения запроса:', error);
      if (error.response) {
        console.error('FriendsManager: Статус ошибки:', error.response.status);
        console.error('FriendsManager: Данные ошибки:', error.response.data);
      }
      setError('Не удалось отклонить запрос дружбы');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя из друзей?')) {
      try {
        await userService.removeFriend(friendId);
        await loadAllData(); // Обновляем все данные
        setError(null);
      } catch (error) {
        console.error('Ошибка удаления друга:', error);
        setError('Не удалось удалить пользователя из друзей');
      }
    }
  };

  const handleStartChat = (user) => {
    if (onStartChat) {
      onStartChat(user);
    }
  };

  const renderUserCard = (user, actions) => (
    <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4 relative">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-semibold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
          {/* Индикатор онлайн статуса */}
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <div className="font-medium text-lg">{user.username}</div>
          {(user.firstName || user.lastName) && (
            <div className="text-gray-600">
              {user.firstName} {user.lastName}
            </div>
          )}
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500">
              {user.isOnline ? (
                <span className="text-green-600 font-medium">В сети</span>
              ) : (
                user.lastSeen ? `Был(а) в сети ${new Date(user.lastSeen).toLocaleString()}` : 'Не в сети'
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {actions}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление друзьями</h1>
        <button
          onClick={() => setShowSearchModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Найти пользователей
        </button>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Табы */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'friends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Друзья ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'incoming'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Входящие ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'outgoing'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Исходящие ({outgoingRequests.length})
        </button>
      </div>

      {/* Содержимое */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 mt-2">Загрузка...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Список друзей */}
          {activeTab === 'friends' && (
            <>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">У вас пока нет друзей</div>
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Найти друзей
                  </button>
                </div>
              ) : (
                friends.map(friend =>
                  renderUserCard(friend, (
                    <>
                      <button
                        onClick={() => handleStartChat(friend)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Написать
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Удалить
                      </button>
                    </>
                  ))
                )
              )}
            </>
          )}

          {/* Входящие запросы */}
          {activeTab === 'incoming' && (
            <>
              {incomingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет входящих запросов
                </div>
              ) : (
                incomingRequests.map(request =>
                  renderUserCard(request, (
                    <>
                      <button
                        onClick={() => handleAcceptFriendRequest(request)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Принять
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(request)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Отклонить
                      </button>
                    </>
                  ))
                )
              )}
            </>
          )}

          {/* Исходящие запросы */}
          {activeTab === 'outgoing' && (
            <>
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет исходящих запросов
                </div>
              ) : (
                outgoingRequests.map(request =>
                  renderUserCard(request, (
                    <div className="text-yellow-600 font-medium bg-yellow-50 px-3 py-2 rounded">
                      Ожидает ответа
                    </div>
                  ))
                )
              )}
            </>
          )}
        </div>
      )}

      {/* Модальное окно поиска */}
      <UserSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onUserSelect={() => {
          setShowSearchModal(false);
          loadAllData(); // Обновляем данные после взаимодействия с пользователем
        }}
        mode="friends"
      />
    </div>
  );
};

export default FriendsManager;
