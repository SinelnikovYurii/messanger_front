import { initApp } from './app.js';
import { showNotification } from './notification.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('Не удалось загрузить приложение', 'error');
    }
});

// Глобальная обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showNotification('Произошла непредвиденная ошибка', 'error');
});