import { NextResponse } from 'next/server';

export function proxy(request) {
  const { nextUrl, cookies, method } = request;
  const token = cookies.get('userToken')?.value;
  const pathname = nextUrl.pathname;
  
  // === ПОЛНОСТЬЮ ПУБЛИЧНЫЕ СТРАНИЦЫ ===
  const publicPages = [
    '/',
    '/about',
    '/contacts',
    '/delivery',
    '/payment',
    '/cart',
    '/auth',
    '/_next',
    '/public',
  ];
  
  const isPublicPage = publicPages.some(page => 
    pathname.startsWith(page) || 
    pathname.match(/^\/product\/[a-zA-Z0-9-_]+$/)
  );
  
  // === МЕТОДЫ ЗАПРОСА ===
  const isPOST = method === 'POST';
  const isGET = method === 'GET';
  
  // === ПРАВИЛА ДЛЯ POST ЗАПРОСОВ ===
  const protectedPostEndpoints = [
    '/api/order/create',
    '/api/order/user',
    '/api/feedback'
  ];
  
  const isProtectedPost = protectedPostEndpoints.some(endpoint => 
    pathname.startsWith(endpoint)
  );
  
  // === ПРАВИЛА ДЛЯ GET ЗАПРОСОВ ===
  const protectedGetPages = [
    '/personal',
    '/personal/orders',
    '/personal/profile',
    '/personal/settings',
    '/api/user/profile',
    '/api/user/orders',
  ];
  
  const isProtectedGet = protectedGetPages.some(page => 
    pathname.startsWith(page)
  );
  
  // === ЛОГИКА ПРОВЕРКИ ===
  
  // 1. Проверка POST запросов
  if (isPOST && isProtectedPost && !token) {
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
    
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', nextUrl.pathname);
    authUrl.searchParams.set('message', 'Для оформления заказа требуется авторизация');
    return NextResponse.redirect(authUrl);
  }
  
  // 2. Проверка GET запросов
  if (isGET && isProtectedGet && !token) {
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }
  
  // 3. Если пользователь авторизован и пытается зайти на страницу авторизации
  if (token && pathname.startsWith('/auth')) {
    const redirectParam = nextUrl.searchParams.get('redirect');
    const redirectUrl = redirectParam 
      ? decodeURIComponent(redirectParam)
      : '/';
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // 4. Для всех остальных случаев пропускаем запрос
  const response = NextResponse.next();
  
  // 5. Добавляем обработку 401 ошибок из бэкенда
  // Если бэкенд возвращает 401, мы перехватим это в fetch-запросах на клиенте
  // Но здесь можно добавить заголовок для клиента
  response.headers.set('X-Auth-Required', 'false');
  
  return response;
}