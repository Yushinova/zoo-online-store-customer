'use client';

export default function TestNotice() {
  console.log('TestNotice рендерится!');
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'red',
      color: 'white',
      padding: '20px',
      zIndex: 999999,
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      ТЕСТОВОЕ УВЕДОМЛЕНИЕ
    </div>
  );
}