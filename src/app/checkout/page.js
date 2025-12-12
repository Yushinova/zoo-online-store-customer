'use client';

import { useEffect, useState } from 'react';
import AddressInput from '@/components/yandex/AddressInput';

export default function TestComponentPage() {
  const [isYmapsLoaded, setIsYmapsLoaded] = useState(false);
  const [receivedData, setReceivedData] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  // Загружаем ymaps3 для тестовой страницы
  useEffect(() => {
    if (window.ymaps3) {
      console.log('✅ ymaps3 уже загружен');
      setIsYmapsLoaded(true);
      return;
    }

    console.log('🔄 Загружаем ymaps3 для теста...');
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Скрипт ymaps3 загружен');
      setIsYmapsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Ошибка загрузки ymaps3');
    };

    document.head.appendChild(script);
  }, []);

  // Обработчик данных из AddressInput
  const handleAddressSelect = (data) => {
    console.log('📨 Получены данные от AddressInput:', data);
    setReceivedData(data);
    
    // Добавляем в историю тестов
    setTestHistory(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      input: data?.formattedAddress || 'Нет данных',
      type: data?.addressType || 'unknown',
      data: data
    }, ...prev.slice(0, 9)]); // Храним последние 10 записей
  };

  // Тестовые сценарии
  const runTestScenario = async (scenario) => {
    console.log(`🧪 Запускаем тест: ${scenario.name}`);
    
    try {
      // Имитируем ввод и выбор подсказки
      const testInput = scenario.query;
      console.log(`Ввод: "${testInput}"`);
      
      // Вызываем suggest напрямую для проверки
      if (window.ymaps3?.suggest) {
        const results = await window.ymaps3.suggest({
          text: testInput,
          results: 5
        });
        
        console.log(`Результаты для "${testInput}":`, results);
        
        if (results.length > 0) {
          // Симулируем выбор первой подсказки
          console.log('Выбираем первую подсказку:', results[0]);
          handleAddressSelect({
            Country: 'Россия',
            City: results[0].subtitle?.text || '',
            Street: results[0].title?.text || '',
            Home: results[0].type === 'house' ? results[0].title?.text?.match(/\d+/)?.[0] || '' : '',
            PostalCode: '',
            UserId: 0,
            formattedAddress: results[0].value || `${results[0].subtitle?.text}, ${results[0].title?.text}`,
            addressType: results[0].type || 'unknown',
            yandexUri: results[0].uri,
            rawSuggestion: results[0]
          });
        }
      }
    } catch (error) {
      console.error(`Ошибка в тесте ${scenario.name}:`, error);
    }
  };

  const testScenarios = [
    { name: 'Улица в Москве', query: 'Москва, Тверская' },
    { name: 'Дом в Москве', query: 'Москва, Тверская 10' },
    { name: 'Ваш адрес', query: 'Красный Сулин, улица Мокроусова 46' },
    { name: 'Город', query: 'Красный Сулин' },
    { name: 'Область', query: 'Ростовская область' }
  ];

  if (!isYmapsLoaded) {
    return (
      <div className="loader-container">
        <div className="spinner-large"></div>
        <p>Загрузка Яндекс.Карт для тестирования...</p>
        <p className="hint">Проверьте консоль (F12) для отслеживания процесса</p>
      </div>
    );
  }

  return (
    <div className="test-container">
      <header className="test-header">
        <h1>🧪 Тестирование компонента AddressInput</h1>
        <p>Проверяем работу подсказок и парсинг данных для C# бэкенда</p>
      </header>

      <div className="test-grid">
        {/* Левая колонка: сам компонент */}
        <div className="test-section">
          <h2>1. Компонент AddressInput</h2>
          <div className="component-wrapper">
            <AddressInput onAddressSelect={handleAddressSelect} />
          </div>
          
          <div className="test-instructions">
            <h3>Как тестировать:</h3>
            <ol>
              <li>Начните вводить адрес в поле выше</li>
              <li>Выберите подсказку из выпадающего списка</li>
              <li>Данные появятся справа в разделе "Результат"</li>
              <li>Проверьте консоль браузера (F12 → Console) для деталей</li>
            </ol>
          </div>
        </div>

        {/* Правая колонка: результат и тесты */}
        <div className="test-section">
          <h2>2. Результат и данные для C#</h2>
          
          {receivedData ? (
            <div className="result-card">
              <div className="result-header">
                <h3>📦 Данные для C# бэкенда</h3>
                <span className="type-badge">{receivedData.addressType || 'unknown'}</span>
              </div>
              
              <div className="data-grid">
    
                <div className="data-field">
                  <label>UserId</label>
                  <div className="data-value">{receivedData.UserId}</div>
                </div>
              </div>
              
              <div className="full-address">
                <label>Полный адрес:</label>
                <div>{receivedData.formattedAddress || 'error'}</div>
              </div>
              
              <details className="raw-data">
                <summary>📋 Показать сырые данные от Яндекса</summary>
                <pre>{JSON.stringify(receivedData.rawSuggestion, null, 2)}</pre>
              </details>
              
              <button 
                onClick={() => {
                  const jsonStr = JSON.stringify({
                    Country: receivedData.Country,
                    City: receivedData.City,
                    Street: receivedData.Street,
                    Home: receivedData.Home,
                    PostalCode: receivedData.PostalCode,
                    UserId: receivedData.UserId
                  }, null, 2);
                  navigator.clipboard.writeText(jsonStr);
                  alert('✅ JSON скопирован в буфер!');
                }}
                className="copy-button"
              >
                📋 Скопировать JSON для бэкенда
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <p>Данные появятся здесь после выбора адреса</p>
              <p className="hint">Попробуйте ввести адрес в поле слева</p>
            </div>
          )}

          <div className="test-scenarios">
            <h3>🚀 Быстрые тесты</h3>
            <div className="scenario-buttons">
              {testScenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => runTestScenario(scenario)}
                  className="scenario-button"
                >
                  {scenario.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* История тестов */}
      {testHistory.length > 0 && (
        <div className="test-history">
          <h3>📋 История тестов (последние 10)</h3>
          <div className="history-list">
            {testHistory.map((test) => (
              <div key={test.id} className="history-item">
                <div className="history-time">{test.time}</div>
                <div className="history-input">{test.input}</div>
                <span className={`history-type ${test.type}`}>{test.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Стили для тестовой страницы */}
      <style jsx>{`
        .test-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .test-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .test-header h1 {
          font-size: 2.5rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        
        .test-header p {
          color: #64748b;
          font-size: 1.1rem;
        }
        
        .test-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        @media (max-width: 1024px) {
          .test-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .test-section {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        
        .test-section h2 {
          color: #334155;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }
        
        .component-wrapper {
          margin-bottom: 2rem;
        }
        
        .test-instructions {
          background: #f0f9ff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #bae6fd;
        }
        
        .test-instructions h3 {
          color: #0369a1;
          margin-bottom: 1rem;
        }
        
        .test-instructions ol {
          padding-left: 1.5rem;
          color: #0c4a6e;
        }
        
        .test-instructions li {
          margin-bottom: 0.5rem;
        }
        
        .result-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .type-badge {
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .data-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .data-field {
          background: white;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .data-field label {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }
        
        .data-value {
          font-weight: 600;
          color: #1e293b;
        }
        
        .data-value.has-value {
          color: #059669;
        }
        
        .full-address {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
        }
        
        .full-address label {
          display: block;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        
        .full-address div {
          font-weight: 500;
          color: #1e293b;
        }
        
        .raw-data {
          margin-bottom: 1.5rem;
        }
        
        .raw-data summary {
          cursor: pointer;
          padding: 0.75rem;
          background: #f1f5f9;
          border-radius: 0.5rem;
          color: #475569;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .raw-data pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .copy-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .copy-button:hover {
          transform: translateY(-2px);
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 0.75rem;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .test-scenarios {
          margin-top: 2rem;
        }
        
        .scenario-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .scenario-button {
          padding: 0.5rem 1rem;
          background: #e2e8f0;
          color: #475569;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .scenario-button:hover {
          background: #cbd5e1;
          transform: translateY(-1px);
        }
        
        .test-history {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        
        .history-list {
          margin-top: 1rem;
        }
        
        .history-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .history-item:last-child {
          border-bottom: none;
        }
        
        .history-time {
          font-size: 0.875rem;
          color: #64748b;
          min-width: 80px;
        }
        
        .history-input {
          flex: 1;
          font-weight: 500;
          color: #334155;
        }
        
        .history-type {
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          color: #475569;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        
        .history-type.toponym { background: #dbeafe; color: #1e40af; }
        .history-type.street { background: #dcfce7; color: #166534; }
        .history-type.house { background: #fef3c7; color: #92400e; }
        .history-type.locality { background: #e0e7ff; color: #3730a3; }
        
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          text-align: center;
        }
        
        .spinner-large {
          width: 4rem;
          height: 4rem;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }
        
        .hint {
          color: #94a3b8;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}