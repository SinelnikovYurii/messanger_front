import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import './RegisterPage.css';

const RegisterPage = () => {
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (userData) => {
        try {
            await register(userData);
            navigate('/login');
        } catch (err) {
            // Ошибка будет обработана в хуке
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <RegisterForm
                    onRegister={handleRegister}
                    loading={loading}
                    error={error}
                />
                <div className="register-footer">
                    <p>
                        Уже есть аккаунт? <Link to="/login">Войти</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;