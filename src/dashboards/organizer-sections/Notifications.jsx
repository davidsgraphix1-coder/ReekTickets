export default function Notifications({ notifications, onRefresh }) {
  const data = notifications || [];

  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon">🔔</div>
        <h1>Notifications</h1>
      </div>

      <div style={{ marginBottom: '16px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
        <button className="btn btn-primary" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {data.length === 0 ? (
          <p className="no-data">No notifications yet.</p>
        ) : (
          data.map(notif => (
            <div 
              key={notif._id || notif.id}
              style={{
                padding: '16px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                gap: '12px',
                backgroundColor: notif.read ? '#fff' : '#f0f7ff',
              }}
            >
              <div style={{ fontSize: '24px', marginTop: '2px' }}>📬</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0' }}>{notif.title}</h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>{notif.message}</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>{new Date(notif.time).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
