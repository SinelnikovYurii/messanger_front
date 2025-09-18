import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/api';
import webSocketService from '../services/websocket';
import { useAuth } from './useAuth.jsx';

export const useChat = () => {
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            connectWebSocket();
        }

        return () => {
            webSocketService.disconnect();
        };
    }, [user]);

    const connectWebSocket = useCallback(() => {
        const token = localStorage.getItem('token');
        if (token) {
            webSocketService.connect(token);

            webSocketService.on('message', handleMessageReceived);
            webSocketService.on('error', handleError);
        }
    }, []);

    const handleMessageReceived = useCallback((message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const handleError = useCallback((error) => {
        setError(error.message || 'Ошибка WebSocket');
    }, []);

    const loadChats = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await chatService.getChats();
            setChats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await chatService.getMessages(chatId);
            setMessages(data);

            // Присоединяемся к чату через WebSocket
            webSocketService.joinChat(chatId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (chatId, content) => {
        try {
            // Отправляем через WebSocket для мгновенного отображения
            webSocketService.sendMessage(chatId, content);

            // Также отправляем через HTTP для сохранения
            await chatService.sendMessage(chatId, { content });
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const createChat = async (participants) => {
        try {
            const newChat = await chatService.createChat({ participants });
            setChats(prev => [...prev, newChat]);
            return newChat;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return {
        chats,
        messages,
        loading,
        error,
        loadChats,
        loadMessages,
        sendMessage,
        createChat
    };
};