import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import './RegisterForm.css';

const RegisterForm = ({ onRegister, loading, error }) => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });

        // Очистка ошибки при изменении поля
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!userData.username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
        }

        if (!userData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Некорректный email';
        }

        if (!userData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (userData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }

        if (userData.password !== userData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onRegister({
                username: userData.username,
                email: userData.email,
                password: userData.password
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <h2>Регистрация</h2>

            {error && <div className="form-error">{error}</div>}

            <Input
                label="Имя пользователя"
                name="username"
                value={userData.username}
                onChange={handleChange}
                error={errors.username}
                required
            />

            <Input
                label="Email"
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                error={errors.email}
                required
            />

            <Input
                label="Пароль"
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                error={errors.password}
                required
            />

            <Input
                label="Подтвердите пароль"
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
            />

            <Button
                type="submit"
                disabled={loading}
                variant="primary"
            >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
        </form>
    );
};

export default RegisterForm;