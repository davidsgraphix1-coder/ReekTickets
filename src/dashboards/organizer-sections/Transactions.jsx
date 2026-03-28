export default function Transactions({ payments, tickets }) {
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalTransactions = payments.length;

  return (
    <div className="section fade-in">
      <div className="section-header">
        <h2>Transactions</h2>
        <p className="section-subtitle">Payment history and earnings</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card stat-card-1">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">GH₵ {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-card-2">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Total Transactions</h3>
            <p className="stat-number">{totalTransactions}</p>
          </div>
        </div>
      </div>

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
    </div>
  );
}
