'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f7f8fc' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>应用出现异常</h2>
          <p style={{ fontSize: 13, color: '#666' }}>请刷新页面重试，本地数据不会丢失。</p>
          <button
            onClick={reset}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              background: '#2f4bff',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            刷新重试
          </button>
        </div>
      </body>
    </html>
  );
}
