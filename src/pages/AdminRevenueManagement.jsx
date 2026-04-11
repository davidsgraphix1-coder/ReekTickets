import { FaCheckCircle, FaTimesCircle, FaClock, FaMoneyBillWave, FaChartLine, FaDollarSign, FaCoins } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import './AdminRevenueManagement.css';

const SERVICE_FEES = {
  standard: 0.05,
  gold: 0.075,
  platinum: 0.10
};

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function AdminRevenueManagement() {
  const [revenue, setRevenue] = useState({
    totalServiceFees: 0,
    totalTransactionFees: 0,
    totalGrandTotal: 0,
    totalWithdrawn: 0,
    availableBalance: 0,
    paymentsByTier: {
      standard: { count: 0, amount: 0, serviceFee: 0 },
      gold: { count: 0, amount: 0, serviceFee: 0 },
      platinum: { count: 0, amount: 0, serviceFee: 0 }
    },
    totalTransactions: 0
  });

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem('reek_token')}`
  };

  const fetchRevenueSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/payments/admin/revenue-summary`, { headers });
      setRevenue(res.data);
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
    }
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/payments/admin/withdrawals`, { headers });
      if (Array.isArray(res.data)) {
        setWithdrawals(res.data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
    setLoading(false);
  };

  const handleRequestWithdrawal = async () => {
    if (!withdrawAmount || !accountNumber || !bankCode || !accountName) {
      alert('Please fill in all bank account details');
      return;
    }

    if (parseFloat(withdrawAmount) > revenue.availableBalance) {
      alert('Withdrawal amount exceeds available balance');
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/payments/admin/request-withdrawal`,
        {
          amount: parseFloat(withdrawAmount),
          accountNumber,
          bankCode,
          accountName
        },
        { headers }
      );

      if (res.data.message) {
        alert(res.data.message);
        setWithdrawAmount('');
        setAccountNumber('');
        setBankCode('');
        setAccountName('');
        setShowWithdrawModal(false);
        await Promise.all([fetchRevenueSummary(), fetchWithdrawals()]);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request withdrawal');
    }
    setWithdrawLoading(false);
  };

  const handleProcessWithdrawal = async (withdrawalId, withdrawalData) => {
    const bankInfo = `${withdrawalData.meta?.accountName} (${withdrawalData.meta?.accountNumber})`;
    if (!window.confirm(`Process withdrawal of GH₵${withdrawalData.amount.toFixed(2)} to ${bankInfo}?`)) {
      return;
    }

    setProcessing({ ...processing, [withdrawalId]: true });
    try {
      const res = await axios.post(
        `${API_BASE}/payments/admin/process-withdrawal/${withdrawalId}`,
        {},
        { headers }
      );

      if (res.data.message && !res.data.message.toLowerCase().includes('error')) {
        alert('Withdrawal processed successfully via Paystack!');
        await Promise.all([fetchRevenueSummary(), fetchWithdrawals()]);
      } else {
        alert(res.data.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert(error.response?.data?.message || 'Network error. Please try again.');
    }
    setProcessing({ ...processing, [withdrawalId]: false });
  };

  useEffect(() => {
    fetchRevenueSummary();
    fetchWithdrawals();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRevenueSummary();
      fetchWithdrawals();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle style={{ color: '#28a745' }} />;
      case 'pending':
        return <FaClock style={{ color: '#ffc107' }} />;
      case 'failed':
        return <FaTimesCircle style={{ color: '#dc3545' }} />;
      default:
        return <FaClock />;
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>
          <FaChartLine /> Revenue & Withdrawals
        </h2>
        <p className="section-subtitle">Manage platform revenue from service fees</p>
      </div>

      {/* Revenue Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card stat-card-1">
          <div className="card-icon"><FaMoneyBillWave /></div>
          <div className="card-content">
            <h3>Total Service Fees</h3>
            <p className="stat-number">
              GH₵ {formatCurrency(revenue.totalServiceFees)}
            </p>
            <small>From all transactions</small>
          </div>
        </div>

        <div className="stat-card stat-card-2">
          <div className="card-icon"><FaCheckCircle /></div>
          <div className="card-content">
            <h3>Available Balance</h3>
            <p className="stat-number">
              GH₵ {formatCurrency(revenue.availableBalance)}
            </p>
            <small>Ready to withdraw</small>
          </div>
        </div>

        <div className="stat-card stat-card-3">
          <div className="card-icon"><FaDollarSign /></div>
          <div className="card-content">
            <h3>Total Withdrawn</h3>
            <p className="stat-number">
              GH₵ {formatCurrency(revenue.totalWithdrawn)}
            </p>
            <small>Cumulative withdrawals</small>
          </div>
        </div>

        <div className="stat-card stat-card-4">
          <div className="card-icon"><FaChartLine /></div>
          <div className="card-content">
            <h3>Total Transactions</h3>
            <p className="stat-number">{(revenue.totalTransactions || 0).toLocaleString()}</p>
            <small>Successful sales</small>
          </div>
        </div>
      </div>

      {/* Revenue by Tier */}
      <div style={{ marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '20px' }}>Revenue Breakdown by Event Tier</h3>
        <div className="tier-cards-grid">
          {Object.entries(revenue.paymentsByTier || {}).map(([tier, data]) => (
            <div key={tier} className="tier-card">
              <h4>{tier} Events</h4>
              <div className="tier-card-row">
                <strong>Transactions:</strong>
                <span>{data.count}</span>
              </div>
              <div className="tier-card-row">
                <strong>Total Sales:</strong>
                <span className="tier-card-value">GH₵ {formatCurrency(data.amount)}</span>
              </div>
              <div className="tier-card-row">
                <strong>Service Fee ({(SERVICE_FEES[tier] * 100).toFixed(1)}%):</strong>
                <span className="tier-card-fee">GH₵ {formatCurrency(data.serviceFee)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Request Button */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button
          onClick={() => setShowWithdrawModal(true)}
          style={{
            padding: '12px 30px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          <FaMoneyBillWave style={{ marginRight: '8px' }} /> Request Withdrawal
        </button>
      </div>

      {/* Pending Withdrawals */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Pending Withdrawals</h3>
        {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p className="no-data">No pending withdrawals</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Amount (GH₵)</th>
                  <th>Bank Account</th>
                  <th>Account Name</th>
                  <th>Requested Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals
                  .filter(w => w.status === 'pending')
                  .map(withdrawal => (
                    <tr key={withdrawal.id}>
                      <td>
                        <strong>
                          {formatCurrency(withdrawal.amount)}
                        </strong>
                      </td>
                      <td>{withdrawal.meta?.accountNumber}</td>
                      <td>{withdrawal.meta?.accountName}</td>
                      <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaClock style={{ color: '#ffc107' }} /> Pending
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleProcessWithdrawal(withdrawal.id, withdrawal)}
                          disabled={processing[withdrawal.id]}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: processing[withdrawal.id] ? 'not-allowed' : 'pointer',
                            opacity: processing[withdrawal.id] ? 0.6 : 1,
                            fontSize: '12px'
                          }}
                        >
                          {processing[withdrawal.id] ? 'Processing...' : 'Approve & Send'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      <div>
        <h3 style={{ marginBottom: '15px' }}>Withdrawal History</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading withdrawals...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p className="no-data">No withdrawals yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Amount (GH₵)</th>
                  <th>Bank Account</th>
                  <th>Account Name</th>
                  <th>Requested Date</th>
                  <th>Processed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map(withdrawal => (
                    <tr key={withdrawal.id}>
                      <td>
                        <strong>
                          {formatCurrency(withdrawal.amount)}
                        </strong>
                      </td>
                      <td>{withdrawal.meta?.accountNumber}</td>
                      <td>{withdrawal.meta?.accountName}</td>
                      <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                      <td>
                        {withdrawal.meta?.processedAt
                          ? new Date(withdrawal.meta.processedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize' }}>
                          {getStatusIcon(withdrawal.status)} {withdrawal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
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
            <h2 style={{ marginBottom: '20px' }}>Request Withdrawal</h2>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ marginBottom: '5px' }}>
                <strong>Available Balance:</strong> GH₵{' '}
                {formatCurrency(revenue.availableBalance)}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <strong>Withdrawal Amount (GH₵)</strong>
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                max={revenue.availableBalance}
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <strong>Account Holder Name</strong>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account holder name"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <strong>Bank Name / Code</strong>
              </label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select bank</option>
                <option value="001">GCB Bank (001)</option>
                <option value="002">Barclays Bank (002)</option>
                <option value="003">Social Security Bank (SSB) (003)</option>
                <option value="004">Zenith Bank (004)</option>
                <option value="005">Access Bank (005)</option>
                <option value="006">First Atlantic Bank (006)</option>
                <option value="007">Ecobank (007)</option>
                <option value="008">Agricultural Development (008)</option>
                <option value="015">MTN Mobile Money (015)</option>
                <option value="016">GT Bank (016)</option>
                <option value="018">Prudential (018)</option>
                <option value="019">International Bank (019)</option>
                <option value="037">CAL Bank (037)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <strong>Account Number</strong>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit account number"
                maxLength="13"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Enter your bank account number (numbers only)
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRequestWithdrawal}
                disabled={withdrawLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: withdrawLoading ? 'not-allowed' : 'pointer',
                  opacity: withdrawLoading ? 0.6 : 1
                }}
              >
                {withdrawLoading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                  setAccountNumber('');
                  setBankCode('');
                  setAccountName('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
