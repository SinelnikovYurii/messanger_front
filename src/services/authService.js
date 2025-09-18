import { authApi } from './api';

export const authService = {
    register: async (userData) => {
        try {
            const response = await authApi.post('/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },

    login: async (credentials) => {
        try {
            const response = await authApi.post('/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        try {
            const response = await authApi.get('/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get user info' };
        }
    }
};