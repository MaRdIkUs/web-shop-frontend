// Простой тест для проверки API сервера
const axios = require('axios');

async function testAPI() {
    const apiUrls = [
        'https://my-site.com/api',
        'https://my-site.com/api/user/profile',
        'https://my-site.com/api/categories/',
        'https://my-site.com/api/cart/'
    ];

    console.log('🔍 Тестирование API сервера...\n');

    for (const url of apiUrls) {
        try {
            console.log(`📡 Тестирую: ${url}`);
            const response = await axios.get(url, {
                timeout: 5000,
                validateStatus: function (status) {
                    return status < 500; // Принимаем любые статусы кроме 5xx
                }
            });
            
            console.log(`✅ Статус: ${response.status} ${response.statusText}`);
            
            if (response.status === 404) {
                console.log(`⚠️  Эндпоинт не найден: ${url}`);
            } else if (response.status === 401) {
                console.log(`🔐 Требуется авторизация: ${url}`);
            } else if (response.status === 302) {
                console.log(`🔄 Редирект: ${response.headers.location || 'неизвестно куда'}`);
            }
            
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`❌ Сервер недоступен: ${url}`);
                console.log(`   Возможно, API сервер не запущен`);
            } else if (error.code === 'ENOTFOUND') {
                console.log(`❌ DNS ошибка: ${url}`);
                console.log(`   Проверьте домен и DNS настройки`);
            } else if (error.code === 'ECONNABORTED') {
                console.log(`⏰ Таймаут: ${url}`);
            } else {
                console.log(`❌ Ошибка: ${error.message}`);
            }
        }
        console.log('');
    }
}

testAPI().catch(console.error); 