import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import chatService from '../services/chatService';
import { addMessage, setConnected } from '../store/slices/chatSlice';
import UserSearchModal from './UserSearchModal';

const ChatWindow = ({ selectedChat, onChatUpdate }) => {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showChatInfo, setShowChatInfo] = useState(false);
    const [showAddParticipants, setShowAddParticipants] = useState(false);
    const [chatInfo, setChatInfo] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);
    const lastLoadedChatId = useRef(null);
    const dispatch = useDispatch();
    const { isConnected } = useSelector(state => state.chat);
    const { token } = useSelector(state => state.auth);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Загружаем сообщения только если чат изменился и не загружается уже
        if (selectedChat && selectedChat.id !== lastLoadedChatId.current && !isLoadingMessages) {
            lastLoadedChatId.current = selectedChat.id;
            loadChatMessages();
            loadChatInfo();
        } else if (!selectedChat) {
            // Очищаем состояние если чат не выбран
            setMessages([]);
            setChatInfo(null);
            lastLoadedChatId.current = null;
        }
    }, [selectedChat?.id]); // Используем только ID для зависимости

    // Подписываемся на события чата
    useEffect(() => {
        // Обработчик событий чата от WebSocket/Kafka
        const handleChatEvent = (event) => {
            console.log('Received chat event:', event);

            if (!selectedChat || event.chatId !== selectedChat.id) {
                return; // Событие не для текущего чата
            }

            switch (event.eventType) {
                case 'CHAT_CREATED':
                    // Обновляем информацию о чате
                    loadChatInfo();
                    break;
                case 'PARTICIPANTS_ADDED':
                    // Добавлены новые участники
                    loadChatInfo();
                    break;
                case 'PARTICIPANT_REMOVED':
                case 'PARTICIPANT_LEFT':
                    // Участник удален или покинул чат
                    loadChatInfo();
                    break;
                case 'CREATOR_CHANGED':
                    // Изменился создатель чата
                    loadChatInfo();
                    break;
                case 'MESSAGE_RECEIVED':
                    // Получено новое сообщение
                    if (event.message) {
                        setMessages(prev => {
                            // Проверяем, нет ли уже такого сообщения
                            const exists = prev.some(msg => msg.id === event.message.id);
                            if (exists) {
                                return prev;
                            }
                            return [...prev, event.message];
                        });
                    }
                    // УБИРАЕМ автоматическую перезагрузку сообщений
                    break;
                default:
                    console.log('Unhandled chat event type:', event.eventType);
            }
        };

        // Подписываемся на события чата
        const unsubscribeChatEvents = chatService.onChatEvent(handleChatEvent);

        return () => {
            // Отписываемся при размонтировании компонента
            unsubscribeChatEvents();
        };
    }, [selectedChat?.id]); // Используем только ID для зависимости

    const loadChatMessages = async () => {
        if (!selectedChat || isLoadingMessages) return;

        try {
            setIsLoadingMessages(true);
            console.log(`Loading messages for chat ${selectedChat.id}`);
            const chatMessages = await chatService.getChatMessages(selectedChat.id);
            setMessages(chatMessages.reverse()); // Разворачиваем, так как API возвращает в обратном порядке
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const loadChatInfo = async () => {
        if (!selectedChat) return;
        try {
            const info = await chatService.getChatInfo(selectedChat.id);
            setChatInfo(info);
            // Уведомляем родительский компонент об обновлении чата
            if (onChatUpdate) onChatUpdate(info);
        } catch (error) {
            console.error('Ошибка загрузки информации о чате:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() && selectedChat) {
            try {
                // Отправляем сообщение через WebSocket
                chatService.sendChatMessage(newMessage.trim(), selectedChat.id);

                // Добавляем локально оптимистичное обновление
                const optimisticMessage = {
                    id: `temp-${Date.now()}`,
                    content: newMessage.trim(),
                    chatId: selectedChat.id,
                    messageType: 'TEXT',
                    sentAt: new Date().toISOString(),
                    sender: {
                        id: null, // Будет заполнено после подтверждения
                        username: 'Вы'
                    },
                    isOptimistic: true // Флаг оптимистичного обновления
                };

                setMessages(prev => [...prev, optimisticMessage]);
                setNewMessage('');
            } catch (error) {
                console.error('Ошибка отправки сообщения:', error);
            }
        }
    };

    const handleAddParticipants = async (selectedUsers) => {
        if (!selectedChat || selectedChat.chatType !== 'GROUP') return;

        try {
            const userIds = selectedUsers.map(user => user.id);
            const updatedChat = await chatService.addParticipants(selectedChat.id, userIds);
            setChatInfo(updatedChat);
            onChatUpdate && onChatUpdate(updatedChat);

            // Показываем системное сообщение локально
            const systemMessage = {
                id: Date.now(),
                content: `Добавлены новые участники: ${selectedUsers.map(u => u.username).join(', ')}`,
                messageType: 'SYSTEM',
                createdAt: new Date().toISOString(),
                sender: null
            };
            setMessages(prev => [...prev, systemMessage]);
        } catch (error) {
            console.error('Ошибка добавления участников:', error);
            alert('Ошибка добавления участников');
        }
    };

    const handleLeaveChat = async () => {
        if (!selectedChat || selectedChat.chatType !== 'GROUP') return;

        if (window.confirm('Вы уверены, что хотите покинуть этот чат?')) {
            try {
                await chatService.leaveChat(selectedChat.id);
                onChatUpdate && onChatUpdate(null); // Уведомляем родительский компонент
            } catch (error) {
                console.error('Ошибка при выходе из чата:', error);
                alert('Ошибка при выходе из чата');
            }
        }
    };

    const getChatTitle = () => {
        if (!selectedChat) return 'Выберите чат';

        if (selectedChat.chatType === 'GROUP') {
            return selectedChat.chatName || 'Групповой чат';
        } else {
            // Для приватного чата показываем имя собеседника
            const participants = chatInfo?.participants || selectedChat.participants || [];
            const otherParticipant = participants.find(p => p.id !== getCurrentUserId());
            return otherParticipant ? otherParticipant.username : 'Приватный чат';
        }
    };

    const getCurrentUserId = () => {
        // TODO: Получить ID текущего пользователя из Redux store
        return 1; // Заглушка
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!selectedChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">Выберите чат для начала общения</div>
                    <div className="text-gray-400">Или найдите пользователей для создания нового чата</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 flex flex-col bg-white">
                {/* Заголовок чата */}
                <div className="border-b border-gray-200 p-4 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <h2 className="text-lg font-semibold">{getChatTitle()}</h2>
                            {selectedChat.chatType === 'GROUP' && chatInfo && (
                                <span className="ml-2 text-sm text-gray-500">
                                    ({chatInfo.participants?.length || 0} участников)
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedChat.chatType === 'GROUP' && (
                                <>
                                    <button
                                        onClick={() => setShowAddParticipants(true)}
                                        className="text-blue-600 hover:text-blue-800 p-2"
                                        title="Добавить участников"
                                    >
                                        👥+
                                    </button>
                                    <button
                                        onClick={handleLeaveChat}
                                        className="text-red-600 hover:text-red-800 p-2"
                                        title="Покинуть чат"
                                    >
                                        🚪
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowChatInfo(!showChatInfo)}
                                className="text-gray-600 hover:text-gray-800 p-2"
                                title="Информация о чате"
                            >
                                ℹ️
                            </button>
                        </div>
                    </div>
                </div>

                {/* Информация о чате */}
                {showChatInfo && chatInfo && (
                    <div className="bg-gray-50 border-b border-gray-200 p-4">
                        <h3 className="font-medium mb-2">Участники чата:</h3>
                        <div className="flex flex-wrap gap-2">
                            {chatInfo.participants?.map(participant => (
                                <div key={participant.id} className="flex items-center bg-white rounded-full px-3 py-1 border">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${participant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm">{participant.username}</span>
                                </div>
                            ))}
                        </div>
                        {selectedChat.chatDescription && (
                            <div className="mt-3">
                                <div className="text-sm font-medium text-gray-700">Описание:</div>
                                <div className="text-sm text-gray-600">{selectedChat.chatDescription}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Список сообщений */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={message.id || index}
                            className={`flex ${
                                message.sender?.id === getCurrentUserId() ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.messageType === 'SYSTEM'
                                    ? 'bg-gray-200 text-gray-600 text-center text-sm mx-auto'
                                    : message.sender?.id === getCurrentUserId()
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                            }`}>
                                {message.sender && selectedChat.chatType === 'GROUP' && message.sender.id !== getCurrentUserId() && (
                                    <div className="text-xs font-medium mb-1 opacity-75">
                                        {message.sender.username}
                                    </div>
                                )}
                                <div className="break-words">{message.content}</div>
                                <div className={`text-xs mt-1 ${
                                    message.messageType === 'SYSTEM' || message.sender?.id === getCurrentUserId()
                                        ? 'opacity-75'
                                        : 'opacity-60'
                                }`}>
                                    {formatTime(message.createdAt)}
                                    {message.isEdited && <span className="ml-1">(изм.)</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Форма отправки сообщений */}
                <div className="border-t border-gray-200 p-4 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Введите сообщение..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Отправить
                        </button>
                    </form>
                </div>
            </div>

            {/* Модальное окно добавления участников */}
            <UserSearchModal
                isOpen={showAddParticipants}
                onClose={() => setShowAddParticipants(false)}
                onUserSelect={handleAddParticipants}
                mode="multiple"
            />
        </>
    );
};

export default ChatWindow;
