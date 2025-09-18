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



    useEffect(() => {
        if (token) {
            dispatch(getCurrentUser());
        }
    }, [token, dispatch]);

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    const AuthRoute = ({ children }) => {
        return !isAuthenticated ? children : <Navigate to="/chat" />;
    };

    return (
        <Router>
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