import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import './css/LoginForm.css';

const LoginForm = ({ onLogin, loading, error }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(credentials);
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2>Вход</h2>

            {error && <div className="form-error">{error}</div>}

            <Input
                label="Имя пользователя"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
            />

            <Input
                label="Пароль"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
            />

            <Button
                type="submit"
                disabled={loading}
                variant="primary"
            >
                {loading ? 'Вход...' : 'Войти'}
            </Button>
        </form>
    );
};

export default LoginForm;