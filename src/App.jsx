import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import EnhancedChatPage from './pages/EnhancedChatPage'; // Используем EnhancedChatPage вместо ChatPage
import FriendsPage from './pages/FriendsPage';
import authService from './services/authService';
import TokenCleaner from './utils/tokenCleaner';


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // КРИТИЧНО: Очищаем устаревшие токены при запуске приложения
        // Это необходимо после изменения JWT секретного ключа на сервере
        const clearStaleTokens = () => {
            const token = localStorage.getItem('token');
            if (token) {
                // Проверяем, не истек ли токен локально
                if (authService.isTokenExpired(token)) {
                    console.log('App: Clearing expired token on startup');
                    authService.clearAuth();
                    return false;
                }
            }
            return true;
        };

        // Проверяем при загрузке приложения
        const initAuth = async () => {
            // КРИТИЧНО: Сначала выполняем автоматическую очистку устаревших токенов
            // Это очистит все токены, созданные со старым JWT секретом
            const wasCleared = TokenCleaner.autoCleanupIfNeeded();

            if (wasCleared) {
                console.log('App: Old tokens were automatically cleared');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Сначала очищаем устаревшие токены
            const hasValidToken = clearStaleTokens();

            if (!hasValidToken) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Сначала быстрая локальная проверка
            const hasValidLocalAuth = authService.hasToken() && authService.getUserData();

            if (hasValidLocalAuth) {
                // Если есть локальные данные, сразу устанавливаем авторизацию
                setIsAuthenticated(true);
                setIsLoading(false);

                // Валидацию на сервере делаем в фоне, но НЕ сбрасываем авторизацию при ошибках
                authService.validateAuthToken().then(isValid => {
                    if (!isValid) {
                        console.log('App: Server validation failed, but keeping local auth for now');
                        // НЕ сбрасываем авторизацию сразу - даем пользователю возможность работать
                        // Авторизация будет сброшена только при явных 401 ошибках от API
                    }
                }).catch(error => {
                    console.error('Background token validation failed, but keeping local auth:', error);
                    // НЕ сбрасываем авторизацию при сетевых ошибках
                });
            } else {
                // Если нет локальных данных, проводим полную проверку
                const isValid = await authService.validateAuthToken();
                setIsAuthenticated(isValid);
                setIsLoading(false);
            }
        };

        initAuth();

        // Подписываемся на изменения авторизации через AuthService
        const unsubscribe = authService.addListener((authenticated) => {
            console.log('Auth state changed via AuthService:', authenticated);
            setIsAuthenticated(authenticated);
        });

        // Слушаем изменения в localStorage (например, при логине в другой вкладке)
        const handleStorageChange = async (e) => {
            if (e.key === 'token' || e.key === 'user') {
                console.log('Storage changed, rechecking auth status');
                const hasValidLocalAuth = authService.hasToken() && authService.getUserData();

                if (hasValidLocalAuth) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Упрощенный обработчик authChange - не делаем повторную валидацию
        const handleAuthChange = () => {
            console.log('Auth change event received');
            const hasValidLocalAuth = authService.hasToken() && authService.getUserData();
            setIsAuthenticated(hasValidLocalAuth);
        };

        window.addEventListener('authChange', handleAuthChange);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    // Показываем загрузку пока проверяем аутентификацию
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" data-app-loading="true">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Проверка авторизации...</p>
                </div>
            </div>
        );
    }

    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? '/chat' : '/login'} replace />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" replace /> : <LoginForm setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/chat" replace /> : <RegisterForm setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/chat" element={isAuthenticated ? <EnhancedChatPage /> : <Navigate to="/login" replace />} />
                <Route path="/friends" element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;