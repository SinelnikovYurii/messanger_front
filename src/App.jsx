import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';

function App() {
    const dispatch = useDispatch();
    const { isAuthenticated, token } = useSelector(state => state.auth);

    // Проверяем токен при загрузке приложения, но только если токен есть
    useEffect(() => {
        if (token && !isAuthenticated) { // Проверяем только если токен есть, но пользователь еще не аутентифицирован
            dispatch(getCurrentUser());
        }
    }, [token, isAuthenticated, dispatch]);

    // ProtectedRoute - для доступа к защищенным маршрутам
    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    // AuthRoute - для доступа к маршрутам аутентификации
    const AuthRoute = ({ children }) => {
        return !isAuthenticated ? children : <Navigate to="/chat" />;
    };

    return (
        <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/login"
                    element={
                        <AuthRoute>
                            <LoginPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AuthRoute>
                            <RegisterPage />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;