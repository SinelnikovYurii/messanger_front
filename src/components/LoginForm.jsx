import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { setToken } from '../utils/auth';

const LoginForm = ({ setIsAuthenticated }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await authApi.post('/auth/login', credentials);
            if (response.status === 200) {
                setToken(response.data.token);
                setIsAuthenticated(true);
                navigate('/chat');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    style={{
                        width: '100%',
                        padding: '10px',
                        margin: '8px 0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.border = '2px solid #007bff'}
                    onBlur={(e) => e.target.style.border = '1px solid #ccc'}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    style={{
                        width: '100%',
                        padding: '10px',
                        margin: '8px 0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.border = '2px solid #007bff'}
                    onBlur={(e) => e.target.style.border = '1px solid #ccc'}
                />
                <button
                    type="submit"
                    style={{
                        padding: '12px',
                        width: '100%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Login
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
            <p style={{ marginTop: '15px' }}>
                Don't have an account? <a href="/register">Register</a>
            </p>
        </div>
    );
};

export default LoginForm;