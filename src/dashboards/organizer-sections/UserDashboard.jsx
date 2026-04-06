import { useState } from 'react';
import { FaUserCircle, FaTicketAlt, FaMoneyBillWave } from 'react-icons/fa';

export default function UserDashboard({ tickets, payments }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const paginatedTickets = tickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="section fade-in">
      <div className="dashboard-title" style={{ marginBottom: '30px' }}>
        <div className="title-icon"><FaUserCircle /></div>
        <h1>My Tickets & Profile</h1>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card stat-card-1">
          <div className="card-icon"><FaTicketAlt /></div>
          <div className="card-content">
            <h3>Total Tickets</h3>
            <p className="stat-number">{tickets.length}</p>
          </div>
        </div>
        <div className="stat-card stat-card-2">
          <div className="card-icon"><FaMoneyBillWave /></div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <p className="stat-number">GH₵ {totalSpent.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-card-3">
          <div className="card-icon"><FaTicketAlt /></div>
          <div className="card-content">
            <h3>Active Tickets</h3>
            <p className="stat-number">{tickets.filter(t => t.status === 'Active').length}</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px' }}>My Tickets</h2>
      {tickets.length === 0 ? (
        <p className="no-data">No tickets purchased yet.</p>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Ticket Type</th>
                  <th>Date Purchased</th>
                  <th>Price</th>
                  <th>Ticket Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket._id} className="table-row-hover">
                    <td><strong>{ticket.event?.title || 'Event'}</strong></td>
                    <td>{ticket.ticketType || 'Standard'}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>GH₵ {ticket.price?.toFixed(2) || '0.00'}</td>
                    <td><code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>{ticket.smsCode || 'N/A'}</code></td>
                    <td><span className="badge badge-success">{ticket.status || 'Active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
