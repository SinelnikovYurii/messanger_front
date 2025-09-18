import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Chat from './components/Chat/Chat';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/login"
                        element={<Login onLogin={handleLogin} />}
                    />
                    <Route
                        path="/register"
                        element={<Register />}
                    />
                    <Route
                        path="/chat"
                        element={isAuthenticated ? <Chat onLogout={handleLogout} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/"
                        element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;