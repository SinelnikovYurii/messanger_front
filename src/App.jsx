import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ChatPage from './pages/ChatPage';


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? '/chat' : '/login'} />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" /> : <LoginForm setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/chat" /> : <RegisterForm setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;