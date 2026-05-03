import { FaCheckCircle, FaTimesCircle, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getAdminPendingPayouts, processAdminPayout } from '../services/api';

export default function AdminPayoutManagement() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});

  const fetchPendingPayouts = async () => {
    setLoading(true);
    try {
      const result = await getAdminPendingPayouts();
      if (Array.isArray(result)) {
        setPayouts(result);
      } else {
        console.error('Failed to fetch payouts:', result.message);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
    setLoading(false);
  };

  const handleProcessPayout = async (payoutId, payoutData) => {
    if (!window.confirm(`Process payout of GH₵${payoutData.amount.toFixed(2)} to ${payoutData.organizerEmail}?`)) {
      return;
    }

    setProcessing({ ...processing, [payoutId]: true });
    try {
      const result = await processAdminPayout(payoutId);
      if (result.message && !result.message.includes('error')) {
        alert('Payout processed successfully via Paystack!');
        fetchPendingPayouts(); // Refresh list
      } else {
        alert(result.message || 'Failed to process payout');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Network error. Please try again.');
    }
    setProcessing({ ...processing, [payoutId]: false });
  };

  useEffect(() => {
    fetchPendingPayouts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingPayouts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>
          <FaMoneyBillWave /> Payouts Management
        </h2>
        <p className="section-subtitle">Review and process pending organizer payouts</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card stat-card-1">
          <div className="card-icon"><FaClock /></div>
          <div className="card-content">
            <h3>Pending Payouts</h3>
            <p className="stat-number">{payouts.length}</p>
            <small>Awaiting processing</small>
          </div>
        </div>
        <div className="stat-card stat-card-2">
          <div className="card-icon"><FaMoneyBillWave /></div>
          <div className="card-content">
            <h3>Total Pending Amount</h3>
            <p className="stat-number">
              GH₵ {payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading payouts...</p>
        </div>
      ) : payouts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p className="no-data">No pending payouts</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Email</th>
                <th>Paystack Email</th>
                <th>Amount (GH₵)</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="table-row-hover">
                  <td style={{ fontWeight: 'bold' }}>{payout.organizerName}</td>
                  <td>{payout.organizerEmail}</td>
                  <td>{payout.meta?.paystackEmail || 'N/A'}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>{new Date(payout.meta?.requestedAt || payout.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-warning">
                      <FaClock style={{ marginRight: '4px' }} /> Pending
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-small btn-success"
                      onClick={() => handleProcessPayout(payout.id, payout)}
                      disabled={processing[payout.id]}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        cursor: processing[payout.id] ? 'not-allowed' : 'pointer',
                        opacity: processing[payout.id] ? 0.6 : 1
                      }}
                    >
                      {processing[payout.id] ? 'Processing...' : 'Approve & Send'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #1976d2' }}>
        <strong>ℹ️ About Payouts</strong>
        <ul style={{ marginTop: '10px', marginBottom: '0', paddingLeft: '20px' }}>
          <li>Payouts use Paystack Transfer API for instant processing</li>
          <li>Funds typically arrive within 1-2 business days</li>
          <li>Each payout generates a Paystack transfer reference for tracking</li>
          <li>Admin approval is required before processing</li>
        </ul>
      </div>
    </div>
  );
}
