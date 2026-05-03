import { FaCommentDots, FaSync } from 'react-icons/fa';

export default function Messages({ messages, onRefresh }) {
  const data = messages || [];

  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon"><FaCommentDots /></div>
        <h1>Messages</h1>
      </div>

      <div style={{ marginBottom: '16px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
        <button className="btn btn-primary" onClick={onRefresh}><FaSync /> Refresh Messages</button>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {data.length === 0 ? (
          <p className="no-data">No messages yet.</p>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '0',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ borderRight: '1px solid #ddd', maxHeight: '500px', overflowY: 'auto' }}>
              {data.map(msg => (
                <div
                  key={msg._id || msg.id}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: msg.unread ? '#e3f2fd' : '#fff',
                  }}
                >
                  <p style={{ margin: '0 0 4px 0', fontWeight: msg.unread ? '600' : '400' }}>{msg.sender}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</p>
                  <p style={{ margin: '0', fontSize: '11px', color: '#999' }}>{new Date(msg.createdAt || msg.time).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ textAlign: 'center', color: '#999' }}>Select a message to read full details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
