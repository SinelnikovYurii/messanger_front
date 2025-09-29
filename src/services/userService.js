import api from './api';

const userService = {
  // Поиск пользователей
  searchUsers: async (query) => {
    const response = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Получить информацию о пользователе
  getUserInfo: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  // Обновить профиль
  updateProfile: async (profileData) => {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  },

  // Управление друзьями
  sendFriendRequest: async (userId) => {
    const response = await api.post('/api/users/friends/request', { userId });
    return response.data;
  },

  respondToFriendRequest: async (requestId, accept) => {
    const response = await api.post('/api/users/friends/respond', {
      requestId,
      accept
    });
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/api/users/friends');
    return response.data;
  },

  getIncomingFriendRequests: async () => {
    const response = await api.get('/api/users/friends/incoming');
    return response.data;
  },

  getOutgoingFriendRequests: async () => {
    const response = await api.get('/api/users/friends/outgoing');
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await api.delete(`/api/users/friends/${friendId}`);
    return response.data;
  },

  // Обновить статус онлайн
  updateOnlineStatus: async (isOnline) => {
    const response = await api.post(`/api/users/status/online?isOnline=${isOnline}`);
    return response.data;
  },

  // Получить всех пользователей (для совместимости)
  getAllUsers: async () => {
    const response = await api.get('/api/users/all');
    return response.data;
  }
};

export default userService;
