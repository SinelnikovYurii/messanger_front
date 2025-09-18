import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth.jsx';
import './LoginPage.css';

const LoginPage = () => {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        try {
            await login(credentials);
            navigate('/');
        } catch (err) {
            // Ошибка будет обработана в хуке
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <LoginForm
                    onLogin={handleLogin}
                    loading={loading}
                    error={error}
                />
                <div className="login-footer">
                    <p>
                        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;