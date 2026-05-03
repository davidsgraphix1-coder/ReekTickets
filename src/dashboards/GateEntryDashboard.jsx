import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import SEO from '../components/SEO';
import QrScanner from '../components/QrScanner';
import { verifyTicketCode, markAttendance } from '../services/api';

export default function GateEntryDashboard() {
  const [scannerActive, setScannerActive] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualTicketId, setManualTicketId] = useState('');
  const [manualAccessCode, setManualAccessCode] = useState('');

  // Auto reset success alert after 5s
  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(''), 6000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const verify = async (ticketId, accessCode) => {
    setError('');
    setStatus('');
    setTicket(null);
    setAttendanceMarked(false);
    if (!ticketId) {
      setError('No ticket data detected. Please try again.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyTicketCode(String(ticketId).trim(), String(accessCode || '').trim());
      setTicket(data);
      setStatus('✅ Ticket verified successfully. Guest may collect their wristband.');
      // Show alert too
      try { window.alert('✅ Ticket verified successfully!\nGuest can now collect their wristband.'); } catch (_) {}
    } catch (err) {
      setError(err?.message || '❌ Ticket verification failed. Ticket not found in our system.');
      try { window.alert('❌ Ticket verification failed.\nThis ticket is not valid.'); } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const handleScan = ({ ticketId, accessCode }) => {
    setScannerActive(false);
    verify(ticketId, accessCode);
  };

  const handleScanError = (msg) => {
    setError(msg);
    setScannerActive(false);
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    verify(manualTicketId, manualAccessCode);
  };

  const handleMarkAttendance = async () => {
    if (!ticket) return;
    setLoading(true);
    setError('');
    try {
      const ref = ticket.reference || ticket.id || ticket._id;
      await markAttendance(ref, ticket.smsCode);
      setAttendanceMarked(true);
      setStatus('✅ Attendance marked successfully.');
      try { window.alert('✅ Attendance marked successfully.'); } catch (_) {}
    } catch (err) {
      setError(err?.message || 'Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTicket(null);
    setStatus('');
    setError('');
    setAttendanceMarked(false);
    setManualTicketId('');
    setManualAccessCode('');
  };

  return (
    <div className="page dashboard-page gate-entry-dashboard fade-in">
      <SEO
        title="Gate Entry Dashboard – ReekTickets"
        description="Scan ticket QR codes at event gates and mark attendance with ReekTickets."
      />

      <div className="page-head glass">
        <h1>Gate Entry — Scan Tickets</h1>
        <p>Scan a ticket's QR code with your device camera to instantly verify it.</p>
      </div>

      <section className="page-content gate-scan-layout">
        {/* SCANNER PANEL */}
        <div className="gate-scanner-panel">
          <div className="gate-scanner-frame">
            {scannerActive ? (
              <QrScanner
                active={scannerActive}
                onScan={handleScan}
                onError={handleScanError}
              />
            ) : (
              <div className="gate-scanner-placeholder">
                <div className="gate-camera-icon" aria-hidden="true">📷</div>
                <p>Tap <strong>Scan Ticket</strong> to open the camera and scan a QR code.</p>
              </div>
            )}
          </div>

          <div className="gate-scanner-actions">
            {!scannerActive ? (
              <button
                className="btn btn-primary gate-scan-btn"
                onClick={() => { reset(); setScannerActive(true); }}
                disabled={loading}
              >
                {loading ? 'Verifying…' : 'Scan Ticket'}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => setScannerActive(false)}>
                Stop Scanner
              </button>
            )}
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setShowManual((s) => !s)}
            >
              {showManual ? 'Hide manual entry' : 'Manual entry'}
            </button>
          </div>

          {showManual && (
            <form className="gate-manual-form" onSubmit={handleManualVerify}>
              <div className="form-group">
                <label>Ticket ID / Reference</label>
                <input
                  type="text"
                  placeholder="Enter ticket reference"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Access Code</label>
                <input
                  type="text"
                  placeholder="Enter access code"
                  value={manualAccessCode}
                  onChange={(e) => setManualAccessCode(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify Ticket'}
              </button>
            </form>
          )}

          {status && <div className="success gate-alert success-alert" style={{ marginTop: 16 }}>{status}</div>}
          {error && <div className="error gate-alert error-alert" style={{ marginTop: 16 }}>{error}</div>}
        </div>

        {/* TICKET RESULT */}
        {ticket && (
          <div className="ticket-card gate-ticket-card">
            <div className="ticket-card-header">
              <h3>{ticket.event?.title || 'Verified Ticket'}</h3>
              <span className={`status-badge status-${(ticket.status || 'active').toLowerCase()}`}>
                {ticket.status || 'Active'}
              </span>
            </div>
            <p><strong>Event:</strong> {ticket.event?.title || 'Unknown event'}</p>
            <p><strong>Date:</strong> {ticket.event?.date ? new Date(ticket.event.date).toLocaleString() : '—'}</p>
            <p><strong>Holder:</strong> {ticket.user?.fullName || ticket.user?.name || 'Guest'}</p>
            <p><strong>Access Code:</strong> {ticket.smsCode || '—'}</p>
            <p><strong>Reference:</strong> {ticket.reference || ticket.id || ticket._id}</p>

            <div className="ticket-qr" style={{ marginTop: 20 }}>
              <QRCode
                value={ticket.reference || ticket.id || ticket._id || 'invalid'}
                size={160}
              />
            </div>

            <div className="gate-ticket-actions">
              {!attendanceMarked ? (
                <button
                  className="btn btn-primary"
                  onClick={handleMarkAttendance}
                  disabled={loading}
                >
                  {loading ? 'Marking…' : 'Mark Attendance'}
                </button>
              ) : (
                <span className="success">✅ Attendance recorded</span>
              )}
              <button className="btn btn-secondary" onClick={reset}>
                Scan Next Ticket
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
