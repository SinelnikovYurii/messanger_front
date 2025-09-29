import React, { useState, useEffect } from 'react';
import chatService from '../services/chatService';
import userService from '../services/userService';
import UserSearchModal from './UserSearchModal';

const CreateGroupChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const [chatName, setChatName] = useState('');
  const [chatDescription, setChatDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    try {
      const friendsData = await userService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Ошибка загрузки друзей:', error);
    }
  };

  const handleCreateChat = async () => {
    if (!chatName.trim()) {
      alert('Введите название чата');
      return;
    }

    if (selectedParticipants.length === 0) {
      alert('Выберите хотя бы одного участника');
      return;
    }

    setLoading(true);
    try {
      const chatData = {
        chatName: chatName.trim(),
        chatDescription: chatDescription.trim(),
        participantIds: selectedParticipants.map(p => p.id)
      };

      const newChat = await chatService.createGroupChat(chatData);
      onChatCreated(newChat);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      alert('Ошибка создания чата');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setChatName('');
    setChatDescription('');
    setSelectedParticipants([]);
  };

  const handleAddParticipants = (users) => {
    const newParticipants = [...selectedParticipants];
    users.forEach(user => {
      if (!newParticipants.find(p => p.id === user.id)) {
        newParticipants.push(user);
      }
    });
    setSelectedParticipants(newParticipants);
  };

  const removeParticipant = (userId) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== userId));
  };

  const toggleFriendSelection = (friend) => {
    if (selectedParticipants.find(p => p.id === friend.id)) {
      removeParticipant(friend.id);
    } else {
      setSelectedParticipants([...selectedParticipants, friend]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Создать групповой чат</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Основная информация о чате */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название чата *
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Введите название чата"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              maxLength={50}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание чата
            </label>
            <textarea
              value={chatDescription}
              onChange={(e) => setChatDescription(e.target.value)}
              placeholder="Введите описание чата (необязательно)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Выбранные участники */}
          {selectedParticipants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">
                Выбранные участники ({selectedParticipants.length})
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedParticipants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span className="mr-2">{participant.username}</span>
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Добавление участников */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Добавить участников</h3>
              <button
                onClick={() => setShowUserSearch(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Поиск пользователей
              </button>
            </div>

            {/* Список друзей */}
            {friends.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2">Ваши друзья</h4>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                  {friends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          {friend.profilePictureUrl ? (
                            <img
                              src={friend.profilePictureUrl}
                              alt={friend.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 text-sm font-semibold">
                              {friend.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{friend.username}</div>
                          {(friend.firstName || friend.lastName) && (
                            <div className="text-sm text-gray-500">
                              {friend.firstName} {friend.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFriendSelection(friend)}
                        className={`px-3 py-1 rounded text-sm ${
                          selectedParticipants.find(p => p.id === friend.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {selectedParticipants.find(p => p.id === friend.id) ? 'Убрать' : 'Добавить'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {friends.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                У вас пока нет друзей для добавления в чат
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              onClick={handleCreateChat}
              disabled={loading || !chatName.trim() || selectedParticipants.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Создание...' : 'Создать чат'}
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно поиска пользователей */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleAddParticipants}
        mode="multiple"
      />
    </>
  );
};

export default CreateGroupChatModal;
