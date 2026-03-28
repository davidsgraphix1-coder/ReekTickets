import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const goToDashboard = (role) => {
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="page dashboard-page fade-in">
      <div className="glass page-head"><h2>Welcome to ReekTickets</h2><p>Select your dashboard.</p></div>
      <div className="dashboard-grid">
        <div className="glass panel" onClick={() => goToDashboard('attendee')}>
          <h3>Attendee Dashboard</h3>
          <p>Buy tickets, manage purchases, view events.</p>
        </div>
        <div className="glass panel" onClick={() => goToDashboard('organizer')}>
          <h3>Organizer Dashboard</h3>
          <p>Create and manage your events.</p>
        </div>
        <div className="glass panel" onClick={() => goToDashboard('vendor')}>
          <h3>Vendor Dashboard</h3>
          <p>Apply for vendor booths and track approvals.</p>
        </div>
        <div className="glass panel" onClick={() => goToDashboard('agent')}>
          <h3>Sales Agent Dashboard</h3>
          <p>Share referral links and track commissions.</p>
        </div>
        {user?.role === 'admin' && (
          <div className="glass panel" onClick={() => goToDashboard('admin')}>
            <h3>Admin Dashboard</h3>
            <p>Manage users and platform settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
