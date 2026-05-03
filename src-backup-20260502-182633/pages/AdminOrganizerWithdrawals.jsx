import { FaCheckCircle, FaTimesCircle, FaClock, FaMoneyBillWave, FaChartLine, FaMobileAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function AdminOrganizerWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const headers = {
    Authorization: `Bearer ${localStorage.getItem('reek_token')}`
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/payments/admin/organizer-withdrawals`, { headers });
      if (Array.isArray(res.data)) {
        setWithdrawals(res.data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
    setLoading(false);
  };

  const handleApproveWithdrawal = async (withdrawalId, withdrawalData) => {
    if (!window.confirm(`Approve withdrawal of GH₵${withdrawalData.amount.toFixed(2)} to ${withdrawalData.meta?.fullName}?`)) {
      return;
    }

    setProcessing({ ...processing, [withdrawalId]: true });
    try {
      const res = await axios.post(
        `${API_BASE}/payments/admin/approve-organizer-withdrawal/${withdrawalId}`,
        {},
        { headers }
      );

      if (res.data.message && !res.data.message.toLowerCase().includes('error')) {
        alert('Withdrawal approved successfully!');
        fetchWithdrawals();
      } else {
        alert(res.data.message || 'Failed to approve withdrawal');
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert(error.response?.data?.message || 'Network error. Please try again.');
    }
    setProcessing({ ...processing, [withdrawalId]: false });
  };

  const handleDeclineWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    setProcessing({ ...processing, [selectedWithdrawal.id]: true });
    try {
      const res = await axios.post(
        `${API_BASE}/payments/admin/decline-organizer-withdrawal/${selectedWithdrawal.id}`,
        { reason: declineReason },
        { headers }
      );

      if (res.data.message && !res.data.message.toLowerCase().includes('error')) {
        alert('Withdrawal declined successfully!');
        setShowDeclineModal(false);
        setDeclineReason('');
        setSelectedWithdrawal(null);
        fetchWithdrawals();
      } else {
        alert(res.data.message || 'Failed to decline withdrawal');
      }
    } catch (error) {
      console.error('Error declining withdrawal:', error);
      alert(error.response?.data?.message || 'Network error. Please try again.');
    }
    setProcessing({ ...processing, [selectedWithdrawal.id]: false });
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const statusColor = (status) => {
    if (status === 'pending') return '#ffc107';
    if (status === 'approved') return '#28a745';
    if (status === 'declined') return '#dc3545';
    return '#6c757d';
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>
          <FaMobileAlt /> Organizer Withdrawal Requests
        </h2>
        <p className="section-subtitle">Manage mobile money withdrawals from organizers</p>
      </div>

      {/* Pending Withdrawals */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Pending Withdrawals ({pendingWithdrawals.length})</h3>
        {pendingWithdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p className="no-data">No pending withdrawal requests</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organizer Name</th>
                  <th>Amount (GH₵)</th>
                  <th>Mobile Number</th>
                  <th>Provider</th>
                  <th>Requested Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map(withdrawal => (
                  <tr key={withdrawal.id}>
                    <td>
                      <strong>{withdrawal.meta?.fullName}</strong>
                    </td>
                    <td>
                      <strong>
                        {formatCurrency(withdrawal.amount)}
                      </strong>
                    </td>
                    <td>{withdrawal.meta?.mobileNumber}</td>
                    <td>{withdrawal.meta?.provider}</td>
                    <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApproveWithdrawal(withdrawal.id, withdrawal)}
                          disabled={processing[withdrawal.id]}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: processing[withdrawal.id] ? 'not-allowed' : 'pointer',
                            opacity: processing[withdrawal.id] ? 0.6 : 1,
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {processing[withdrawal.id] ? 'Processing...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowDeclineModal(true);
                          }}
                          disabled={processing[withdrawal.id]}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: processing[withdrawal.id] ? 'not-allowed' : 'pointer',
                            opacity: processing[withdrawal.id] ? 0.6 : 1,
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Withdrawal History */}
      <div>
        <h3 style={{ marginBottom: '15px' }}>All Withdrawal Requests</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading withdrawals...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p className="no-data">No withdrawal requests</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organizer Name</th>
                  <th>Amount (GH₵)</th>
                  <th>Mobile Number</th>
                  <th>Provider</th>
                  <th>Requested Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map(withdrawal => (
                    <tr key={withdrawal.id}>
                      <td>
                        <strong>{withdrawal.meta?.fullName}</strong>
                      </td>
                      <td>
                        <strong>
                          {formatCurrency(withdrawal.amount)}
                        </strong>
                      </td>
                      <td>{withdrawal.meta?.mobileNumber}</td>
                      <td>{withdrawal.meta?.provider}</td>
                      <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                      <td>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textTransform: 'capitalize',
                          color: statusColor(withdrawal.status),
                          fontWeight: 'bold'
                        }}>
                          {withdrawal.status === 'pending' && <FaClock />}
                          {withdrawal.status === 'approved' && <FaCheckCircle />}
                          {withdrawal.status === 'declined' && <FaTimesCircle />}
                          {withdrawal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Decline Withdrawal</h2>

            <div style={{ marginBottom: '15px' }}>
              <p><strong>Organizer:</strong> {selectedWithdrawal?.meta?.fullName}</p>
              <p><strong>Amount:</strong> GH₵ {selectedWithdrawal ? formatCurrency(selectedWithdrawal.amount) : '0.00'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <strong>Reason for Decline (Optional)</strong>
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="E.g., Invalid phone number, Wrong account details, etc."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setSelectedWithdrawal(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineWithdrawal}
                disabled={processing[selectedWithdrawal?.id]}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processing[selectedWithdrawal?.id] ? 'not-allowed' : 'pointer',
                  opacity: processing[selectedWithdrawal?.id] ? 0.6 : 1,
                  fontWeight: 'bold'
                }}
              >
                {processing[selectedWithdrawal?.id] ? 'Processing...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
