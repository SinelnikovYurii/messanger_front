import { useState, useContext, createContext, useEffect } from 'react';
import { authService, userService } from '../services/api';

// Создаем контекст
const AuthContext = createContext();

// Хук для использования контекста
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Провайдер контекста
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await userService.getProfile();
            setUser(profile);
        } catch (err) {
            console.error('Error loading user profile:', err);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);
            localStorage.setItem('token', response.token);

            const profile = await userService.getProfile();
            setUser(profile);

            return response;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Ошибка входа');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.register(userData);
            return response;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Ошибка регистрации');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateProfile = async (userData) => {
        try {
            const updatedUser = await userService.updateProfile(userData);
            setUser(updatedUser);
            return updatedUser;
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'Ошибка обновления профиля');
            throw err;
        }
    };

    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};