import { FaMoneyBillWave, FaChartPie, FaCreditCard } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { requestOrganizerPayout, getOrganizerPayouts, getPaymentSummary } from '../../services/api';

export default function Transactions({ payments, tickets }) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paystackEmail, setPaystackEmail] = useState('');
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handlePayoutRequest = async () => {
    if (!payoutAmount || payoutAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (payoutAmount > availableBalance) {
      alert('Amount exceeds available balance');
      return;
    }

    if (!paystackEmail || !paystackEmail.includes('@')) {
      alert('Please provide a valid Paystack email address');
      return;
    }

    setLoading(true);
    try {
      const result = await requestOrganizerPayout(parseFloat(payoutAmount), paystackEmail);
      if (result.message && !result.message.includes('error')) {
        alert('Payout request submitted successfully! Admin will process it shortly. Funds typically arrive within 1-2 business days.');
        setShowPayoutModal(false);
        setPayoutAmount('');
        setPaystackEmail('');
        // Refresh payout history
        fetchPayoutHistory();
      } else {
        alert(result.message || 'Payout request failed');
      }
    } catch (error) {
      console.error('Payout error:', error);
      alert('Network error. Please try again.');
    }
    setLoading(false);
  };

  const fetchPayoutHistory = async () => {
    try {
      const result = await getOrganizerPayouts();
      if (Array.isArray(result)) {
        setPayoutHistory(result);
      }
    } catch (error) {
      console.error('Failed to fetch payout history:', error);
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

  // Fetch payout history and payment summary on component mount
  useEffect(() => {
    fetchPayoutHistory();
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

      {/* Payout Section */}
      <div className="payout-section" style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Request Payout</h3>
        <p>Withdraw your available earnings via Paystack. Admin approval required.</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowPayoutModal(true)}
          disabled={availableBalance <= 0}
        >
          Request Payout
        </button>
      </div>

      {/* Payout History */}
      {payoutHistory.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Payout History</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((payout) => (
                  <tr key={payout._id}>
                    <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                    <td>GH₵ {Math.abs(payout.amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${payout.status === 'pending' ? 'badge-warning' : payout.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td>{payout._id}</td>
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

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="modal-overlay" onClick={() => setShowPayoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Payout</h3>
              <button className="modal-close" onClick={() => setShowPayoutModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Amount (GH₵)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max={availableBalance}
                  step="0.01"
                />
                <small>Available: GH₵ {availableBalance.toFixed(2)}</small>
              </div>

              <div className="form-group">
                <label>Paystack Email</label>
                <input
                  type="email"
                  value={paystackEmail}
                  onChange={(e) => setPaystackEmail(e.target.value)}
                  placeholder="Enter Paystack account email"
                />
                <small>The email linked to your Paystack account</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPayoutModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handlePayoutRequest}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Request Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
