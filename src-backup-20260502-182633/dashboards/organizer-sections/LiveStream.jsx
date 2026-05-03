import { FaVideo, FaClipboard } from 'react-icons/fa';

export default function LiveStream({ events }) {
  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon"><FaVideo /></div>
        <h1>Live Stream</h1>
      </div>

      {events.length === 0 ? (
        <p className="no-data">Create an event first to enable live streaming.</p>
      ) : (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '20px' }}>Select Event to Stream</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {events.map(event => (
              <div 
                key={event._id}
                style={{
                  padding: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{event.title}</h4>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                    {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                  </p>
                </div>
                <button className="btn btn-primary">Setup Stream</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '8px' }}>
            <h4><FaClipboard /> Live Stream Setup Requirements</h4>
            <ul style={{ fontSize: '14px', color: '#333', marginTop: '10px' }}>
              <li>Stable internet connection (5 Mbps minimum)</li>
              <li>Camera or streaming device</li>
              <li>Microphone for audio</li>
              <li>Stream key and URL will be provided</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
