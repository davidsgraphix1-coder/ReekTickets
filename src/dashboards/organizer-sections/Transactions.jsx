import { FaMoneyBillWave, FaChartPie, FaCreditCard } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../../config/api';
import { getOrganizerPayouts, getPaymentSummary } from '../../services/api';

const MobileMoneyProviders = ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money'];

export default function Transactions({ payments, tickets }) {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrganizerEarnings: 0,
    totalServiceFees: 0,
    totalTransactionFees: 0,
    totalTickets: 0,
    totalSales: 0
  });

  const totalRevenue = summary.totalRevenue;
  const availableBalance = summary.totalOrganizerEarnings;

  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      alert('Amount exceeds available balance');
      return;
    }

    if (!mobileNumber || mobileNumber.length < 9) {
      alert('Please enter a valid mobile money number');
      return;
    }

    if (!provider) {
      alert('Please select a mobile money provider');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('reek_token')}` };
      const response = await axios.post(
        `${API_BASE}/payments/organizer/request-withdrawal`,
        {
          amount: parseFloat(withdrawalAmount),
          mobileNumber,
          provider,
          fullName
        },
        { headers }
      );

      if (response.data.message && !response.data.message.includes('error')) {
        alert('Withdrawal request submitted successfully! Admin will process it shortly.');
        setShowWithdrawalModal(false);
        setWithdrawalAmount('');
        setMobileNumber('');
        setProvider('');
        fetchWithdrawalHistory();
      } else {
        alert(response.data.message || 'Withdrawal request failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(error.response?.data?.message || 'Network error. Please try again.');
    }
    setLoading(false);
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('reek_token')}` };
      const response = await axios.get(`${API_BASE}/payments/organizer/withdrawals`, { headers });
      if (Array.isArray(response.data)) {
        setWithdrawalHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal history:', error);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const result = await getPaymentSummary();
      if (result && !result.message) {
        setSummary(result);
      }
    } catch (error) {
      console.error('Failed to fetch payment summary:', error);
    }
  };

  // Fetch withdrawal history, payment summary, and user data on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('reek_user') || '{}');
    setFullName(user.full_name || user.fullName || '');
    
    fetchWithdrawalHistory();
    fetchPaymentSummary();
  }, []);

  return (
    <div className="section fade-in">
      <div className="section-header">
        <h2>Transactions & Payouts</h2>
        <p className="section-subtitle">Payment history, earnings, and payout management</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card stat-card-1">
          <div className="card-icon"><FaMoneyBillWave /></div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">GH₵ {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-card-2">
          <div className="card-icon"><FaChartPie /></div>
          <div className="card-content">
            <h3>Available Balance</h3>
            <p className="stat-number">GH₵ {availableBalance.toLocaleString()}</p>
            <small style={{ color: '#666' }}>After service & transaction fees</small>
          </div>
        </div>
        <div className="stat-card stat-card-3">
          <div className="card-icon"><FaCreditCard /></div>
          <div className="card-content">
            <h3>Platform Fees</h3>
            <p className="stat-number">GH₵ {(summary.totalServiceFees + summary.totalTransactionFees).toLocaleString()}</p>
            <small style={{ color: '#666' }}>Service: GH₵ {summary.totalServiceFees.toLocaleString()} | Trans: GH₵ {summary.totalTransactionFees.toLocaleString()}</small>
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="payout-section" style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Request Withdrawal</h3>
        <p>Withdraw your available earnings via Mobile Money. Admin approval required.</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowWithdrawalModal(true)}
          disabled={availableBalance <= 0}
        >
          Request Withdrawal
        </button>
      </div>

      {/* Withdrawal History */}
      {withdrawalHistory.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Withdrawal History</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Mobile Number</th>
                  <th>Provider</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                    <td>GH₵ {withdrawal.amount.toFixed(2)}</td>
                    <td>{withdrawal.meta?.mobileNumber}</td>
                    <td>{withdrawal.meta?.provider}</td>
                    <td>
                      <span className={`badge ${withdrawal.status === 'pending' ? 'badge-warning' : withdrawal.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History */}
      <h3>Payment History</h3>
      {payments.length === 0 ? (
        <p className="no-data">No payment transactions yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="table-row-hover">
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td><strong>{payment.reference || 'N/A'}</strong></td>
                  <td>GH₵ {payment.amount?.toFixed(2) || '0.00'}</td>
                  <td><span className="badge badge-success">{payment.status || 'Completed'}</span></td>
                  <td>{payment.method || 'Paystack'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Withdrawal</h3>
              <button className="modal-close" onClick={() => setShowWithdrawalModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  disabled
                  placeholder="Your full name"
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>

              <div className="form-group">
                <label>Amount (GH₵)</label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max={availableBalance}
                  step="0.01"
                />
                <small>Available: GH₵ {availableBalance.toFixed(2)}</small>
              </div>

              <div className="form-group">
                <label>Mobile Money Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="">Select provider</option>
                  {MobileMoneyProviders.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mobile Money Number</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter mobile money number (e.g., 0241234567)"
                />
                <small>Format: 10 digits starting with 0</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowWithdrawalModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleWithdrawalRequest}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Submit Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
