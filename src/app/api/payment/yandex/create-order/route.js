import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, orderId, merchantId } = await request.json();
    
    // В РЕАЛЬНОМ ПРОЕКТЕ: 
    // 1. Создать заказ в Яндекс Pay API
    // 2. Получить paymentUrl
    
    // ДЛЯ ТЕСТОВ: возвращаем заглушку
    const testPaymentUrl = `https://sandbox.pay.yandex.ru/pay?merchantId=${merchantId}&orderId=${orderId}&amount=${amount}`;
    
    return NextResponse.json({
      success: true,
      paymentUrl: testPaymentUrl,
      orderId: orderId,
      test: true,
      message: 'Тестовый режим. В реальном проекте используйте Яндекс Pay API'
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}