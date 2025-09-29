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
    const messagesEndRef = useRef(null);
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
        if (selectedChat) {
            loadChatMessages();
            loadChatInfo();
        }
    }, [selectedChat]);

    const loadChatMessages = async () => {
        if (!selectedChat) return;
        try {
            const chatMessages = await chatService.getChatMessages(selectedChat.id);
            setMessages(chatMessages.reverse()); // Разворачиваем, так как API возвращает в обратном порядке
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    };

    const loadChatInfo = async () => {
        if (!selectedChat) return;
        try {
            const info = await chatService.getChatInfo(selectedChat.id);
            setChatInfo(info);
        } catch (error) {
            console.error('Ошибка загрузки информации о чате:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() && selectedChat) {
            try {
                const messageData = {
                    chatId: selectedChat.id,
                    content: newMessage.trim(),
                    messageType: 'TEXT'
                };

                const sentMessage = await chatService.sendMessage(messageData);
                setMessages(prev => [...prev, sentMessage]);
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

            // Показываем системное сообщение
            const systemMessage = {
                id: Date.now(),
                content: `Добавлены новые участники: ${selectedUsers.map(u => u.username).join(', ')}`,
                messageType: 'SYSTEM',
                createdAt: new Date(),
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
