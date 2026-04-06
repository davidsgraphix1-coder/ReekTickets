import { useState } from 'react';
import { FaChartPie, FaMoneyBillWave, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

export default function DashboardHome({ events, tickets, stats }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterEvent, setFilterEvent] = useState('all');
  const itemsPerPage = 10;

  const filteredTickets = filterEvent === 'all' 
    ? tickets 
    : tickets.filter(t => {
        const eventId = t.event?._id || t.event;
        return eventId === filterEvent;
      });
  
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="dashboard-title">
        <div className="title-icon"><FaChartPie /></div>
        <h1>DASHBOARD</h1>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card stat-card-1">
          <div className="card-icon"><FaMoneyBillWave /></div>
          <div className="card-content">
            <h3>Top Selling Event</h3>
            <p className="stat-number">GH₵ {stats.topEventRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card stat-card-2">
          <div className="card-icon"><FaCalendarAlt /></div>
          <div className="card-content">
            <h3>Total Events</h3>
            <p className="stat-number">{stats.totalEvents}</p>
          </div>
        </div>

        <div className="stat-card stat-card-3">
          <div className="card-icon"><FaTicketAlt /></div>
          <div className="card-content">
            <h3>Top Event Ticket Sold</h3>
            <p className="stat-number">{stats.ticketsSold}</p>
          </div>
        </div>
      </div>

      {/* EVENTS SECTION */}
      <div className="section events-section fade-in">
        <div className="section-header">
          <h2>Events</h2>
          <p className="section-subtitle">Recent Tickets Overview</p>
        </div>

        {events.length === 0 ? (
          <p className="no-data">No Data Found!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Audience</th>
                  <th>Event Date</th>
                  <th>Event Name</th>
                  <th>Tickets</th>
                  <th>Purchased Date</th>
                  <th>Total Currency</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const eventTickets = tickets.filter(t => {
                    const ticketEventId = t.event?._id || t.event;
                    return ticketEventId === event._id;
                  });
                  const eventRevenue = eventTickets.reduce((sum, t) => sum + (t.price || 0), 0);
                  
                  return (
                    <tr key={event._id} className="table-row-hover">
                      <td>{eventTickets.length}</td>
                      <td>{new Date(event.date).toLocaleDateString()}</td>
                      <td><strong>{event.title}</strong></td>
                      <td>{event.ticketTypes?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0}</td>
                      <td>{new Date(event.createdAt || new Date()).toLocaleDateString()}</td>
                      <td>GH₵ {eventRevenue.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT VISITOR OVERVIEW */}
      <div className="section visitor-section fade-in">
        <div className="section-header-with-filter">
          <div>
            <h2>Recent Visitor Overview</h2>
          </div>
          <select 
            className="filter-dropdown"
            value={filterEvent}
            onChange={(e) => {
              setFilterEvent(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Select to filter for an event</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>
        </div>

        {paginatedTickets.length === 0 ? (
          <p className="no-data">No Data Found!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>S. No</th>
                  <th>Date</th>
                  <th>Event Name</th>
                  <th>Ticket Name</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Qty</th>
                  <th>Actual Amount</th>
                  <th>Handling Fees</th>
                  <th>Service Fees</th>
                  <th>Earning Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map((ticket, idx) => {
                  const actualPrice = ticket.price || 0;
                  const handlingFee = 0.50;
                  const serviceFee = 0.50;
                  const earningAmount = actualPrice - handlingFee - serviceFee;
                  
                  return (
                    <tr key={ticket._id} className="table-row-hover">
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{new Date(ticket.createdAt || new Date()).toLocaleDateString()}</td>
                      <td><strong>{ticket.event?.title || 'N/A'}</strong></td>
                      <td>{ticket.ticketType || 'Standard'}</td>
                      <td>{ticket.user?.fullName || ticket.user?.phone || 'N/A'}</td>
                      <td>{ticket.user?.email || 'N/A'}</td>
                      <td>{ticket.user?.phone || 'N/A'}</td>
                      <td>1</td>
                      <td>GH₵ {actualPrice.toFixed(2)}</td>
                      <td>GH₵ {handlingFee.toFixed(2)}</td>
                      <td>GH₵ {serviceFee.toFixed(2)}</td>
                      <td>GH₵ {earningAmount.toFixed(2)}</td>
                      <td><span className="badge badge-success">{ticket.status || 'Active'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
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
      </div>
    </>
  );
}
