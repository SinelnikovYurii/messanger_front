const API_URL = 'http://localhost:3000';

export const api = {
    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const token = localStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            throw new Error(error.message || 'Network error');
        }
    },

    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    async register(username, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    async getMessages() {
        return this.request('/messages');
    },

    async sendMessage(content) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }
};