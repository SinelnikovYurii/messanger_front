import { userApi } from './api';

export const userService = {
    getAllUsers: async () => {
        try {
            const response = await userApi.get('/');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch users' };
        }
    },

    getUserById: async (id) => {
        try {
            const response = await userApi.get(`/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user' };
        }
    }
};