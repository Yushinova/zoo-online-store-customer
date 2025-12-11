'use client';

import { useUser } from '@/app/providers/UserProvider';

export default function DebugUser() {
  const { user, loading, logout } = useUser();
  
  // Автоматически логируем в консоль
  console.log('👤 User data:', user);
  console.log('⏳ Loading:', loading);
  
  if (loading) return <div>Loading...</div>;
  
  const handleLogout = async () => {
    console.log('🚪 Logging out...');
    await logout();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: '#333', 
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '400px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <strong style={{ fontSize: '14px' }}>🔍 Debug Panel</strong>
        
        {/* Кнопка логаута */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              background: '#ff4757',
              color: 'white',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚪 Logout
          </button>
        )}
      </div>
      
      {/* Информация о пользователе */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span>👤 Status:</span>
          <span style={{
            background: user ? '#2ed573' : '#ff6b81',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '10px'
          }}>
            {user ? 'AUTHORIZED' : 'GUEST'}
          </span>
        </div>
        
        {user ? (
          <div>
            {/* Краткая информация */}
            <div style={{ marginBottom: '8px' }}>
              <strong>📋 User Info:</strong>
              <div style={{ marginLeft: '10px', marginTop: '4px' }}>
                <div>📛 Name: <strong>{user.name}</strong></div>
                <div>📱 Phone: {user.phone}</div>
                <div>📧 Email: {user.email}</div>
                <div>🎯 Discount: {user.discont}%</div>
                <div>📦 Orders: {user.totalOrders}</div>
                <div>🆔 UUID: <span style={{ fontSize: '9px' }}>{user.uuid}</span></div>
              </div>
            </div>
            
            {/* Кнопка показать полные данные */}
            <details>
              <summary style={{ 
                cursor: 'pointer',
                color: '#70a1ff',
                fontSize: '11px',
                marginBottom: '5px'
              }}>
                📄 Show full JSON data
              </summary>
              <pre style={{ 
                background: '#222',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '10px',
                marginTop: '5px',
                maxHeight: '200px'
              }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div style={{ color: '#aaa' }}>
            🔓 Not authenticated. User data is null.
          </div>
        )}
      </div>
      
      {/* Информация о хранилищах */}
      <details>
        <summary style={{ 
          cursor: 'pointer',
          color: '#70a1ff',
          fontSize: '11px'
        }}>
          💾 Show storage info
        </summary>
        <div style={{ 
          background: '#222',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '5px',
          fontSize: '10px'
        }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>sessionStorage:</strong>
            <div style={{ marginLeft: '10px' }}>
              <div>apiKey: {sessionStorage.getItem('apiKey') ? '✅ Present' : '❌ Empty'}</div>
              <div>userCache: {sessionStorage.getItem('userCache') ? '✅ Present' : '❌ Empty'}</div>
            </div>
          </div>
          
          <button
            onClick={() => {
              console.log('🧹 Clearing storage...');
              sessionStorage.clear();
              localStorage.clear();
              console.log('✅ Storage cleared');
              window.location.reload();
            }}
            style={{
              background: '#576574',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              marginTop: '5px'
            }}
          >
            🧹 Clear All Storage
          </button>
        </div>
      </details>
      
      {/* Кнопки управления */}
      <div style={{ 
        display: 'flex', 
        gap: '5px',
        marginTop: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => console.log('User object:', user)}
          style={{
            background: '#3742fa',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          📝 Log to Console
        </button>
        
        <button
          onClick={() => {
            if (user) {
              const userData = {
                name: user.name,
                phone: user.phone,
                email: user.email,
                discont: user.discont,
                totalOrders: user.totalOrders,
                uuid: user.uuid
              };
              navigator.clipboard.writeText(JSON.stringify(userData, null, 2));
              console.log('📋 User data copied to clipboard');
            }
          }}
          style={{
            background: '#2ed573',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          📋 Copy User Data
        </button>
        
        <button
          onClick={() => {
            const apiKey = sessionStorage.getItem('apiKey');
            console.log('🔑 API Key:', apiKey);
            if (apiKey) {
              navigator.clipboard.writeText(apiKey);
              console.log('📋 API Key copied to clipboard');
            }
          }}
          style={{
            background: '#ffa502',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          🔑 Show API Key
        </button>
      </div>
    </div>
  );
}