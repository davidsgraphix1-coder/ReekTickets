export default function UserManagement({ tickets, users }) {
  const uniqueUsers = [...new Map(
    tickets.map(t => t.user?.email || t.user?._id)
      .map((email, idx) => [email, tickets[idx]])
      .filter(([email]) => email)
  ).values()].map(t => t.user).filter(Boolean);

  return (
    <div className="section fade-in">
      <div className="section-header">
        <h2>User Management</h2>
        <p className="section-subtitle">Manage attendees and customers</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card stat-card-2">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="stat-number">{uniqueUsers.length}</p>
          </div>
        </div>
      </div>

      {uniqueUsers.length === 0 ? (
        <p className="no-data">No users yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Tickets Purchased</th>
                <th>Total Spent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {uniqueUsers.map((user) => {
                const userTickets = tickets.filter(t => t.user?._id === user._id);
                const totalSpent = userTickets.reduce((sum, t) => sum + (t.price || 0), 0);
                
                return (
                  <tr key={user._id} className="table-row-hover">
                    <td><strong>{user.fullName || user.phone || 'Guest'}</strong></td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{userTickets.length}</td>
                    <td>GH₵ {totalSpent.toFixed(2)}</td>
                    <td><span className="badge badge-success">{user.status || 'Active'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
