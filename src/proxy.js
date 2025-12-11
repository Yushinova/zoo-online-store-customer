import { NextResponse } from 'next/server';

export function proxy(request) {
  const { nextUrl, cookies, method } = request;
  const token = cookies.get('userToken')?.value;
  const pathname = nextUrl.pathname;
  
  // === ПОЛНОСТЬЮ ПУБЛИЧНЫЕ СТРАНИЦЫ ===
  const publicPages = [
    '/',                    // Главная
    '/catalog',             // Каталог
    '/product',             // Страница товара
    '/about',               // О нас
    '/contacts',            // Контакты
    '/delivery',            // Доставка
    '/payment',             // Оплата
    '/cart',                // Корзина (просмотр)
    '/auth',                // Авторизация
    '/api/public',          // Публичные API
    '/_next',               // Статика Next.js
    '/public',              // Публичные файлы
    '/favicon.ico',         // Фавикон
  ];
  
  // Проверяем, является ли страница публичной
  const isPublicPage = publicPages.some(page => 
    pathname.startsWith(page) || 
    pathname.match(/^\/product\/[a-zA-Z0-9-_]+$/) // Динамические страницы товаров
  );
  
  // === МЕТОДЫ ЗАПРОСА ===
  const isPOST = method === 'POST';
  const isGET = method === 'GET';
  
  // === ПРАВИЛА ДЛЯ POST ЗАПРОСОВ ===
  
  // POST запросы, требующие авторизации
  const protectedPostEndpoints = [
    '/api/order/create',    // Создание заказа
    '/api/order/user',    // Оформление заказа
    '/api/feedback'    // Добавление отзыва
  ];
  
  const isProtectedPost = protectedPostEndpoints.some(endpoint => 
    pathname.startsWith(endpoint)
  );
  
  // === ПРАВИЛА ДЛЯ GET ЗАПРОСОВ ===
  
  // GET запросы, требующие авторизации
  const protectedGetPages = [
    '/personal',            // Личный кабинет
    '/personal/orders',     // Заказы
    '/personal/profile',    // Профиль
    '/personal/settings',   // Настройки
    '/api/user/profile',    // API профиля
    '/api/user/orders',     // API заказов
  ];
  
  const isProtectedGet = protectedGetPages.some(page => 
    pathname.startsWith(page)
  );
  
  // === ЛОГИКА ПРОВЕРКИ ===
  
  // 1. Проверка POST запросов (оформление заказа, отзывы)
  if (isPOST && isProtectedPost && !token) {
    // Для API запросов возвращаем JSON ошибку
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'unauthorized',
          message: 'Для выполнения этого действия требуется авторизация',
          redirect: '/auth'
        },
        { status: 401 }
      );
    }
    
    // Для обычных POST запросов редирект на авторизацию
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', nextUrl.pathname);
    authUrl.searchParams.set('message', 'Для оформления заказа требуется авторизация');
    return NextResponse.redirect(authUrl);
  }
  
  // 2. Проверка GET запросов (личный кабинет)
  if (isGET && isProtectedGet && !token) {
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }
  
  // 3. Если пользователь авторизован и пытается зайти на страницу авторизации
  if (token && pathname.startsWith('/auth')) {
    // Проверяем, есть ли параметр для редиректа
    const redirectParam = nextUrl.searchParams.get('redirect');
    const redirectUrl = redirectParam 
      ? decodeURIComponent(redirectParam)
      : '/';
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // 4. Для всех остальных случаев пропускаем запрос
  return NextResponse.next();
}

// Конфигурация для matcher
export const config = {
  matcher: [
    /*
     * Обрабатываем все маршруты
     * Статические файлы тоже обрабатываем, так как они могут быть защищены
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};