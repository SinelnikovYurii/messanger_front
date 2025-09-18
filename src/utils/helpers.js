// Форматирование даты
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        return date.toLocaleDateString('ru-RU');
    }
};

// Валидация email
export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Валидация пароля
export const isValidPassword = (password) => {
    return password.length >= 6;
};

// Форматирование имени пользователя
export const formatUsername = (username) => {
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
};

// Обрезка длинного текста
export const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Генерация аватара (заглушка)
export const generateAvatar = (username) => {
    const initials = username
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return {
        initials,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
};

// Проверка онлайн статуса
export const isUserOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now - lastSeenDate) / (1000 * 60);
    return diffInMinutes < 5; // онлайн если был менее 5 минут назад
};