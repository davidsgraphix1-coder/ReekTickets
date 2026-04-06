import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const role = user.role;
    if (role === 'admin') navigate('/dashboard/admin');
    else if (role === 'organizer') navigate('/dashboard/organizer');
    else if (role === 'vendor') navigate('/dashboard/vendor');
    else if (role === 'agent') navigate('/dashboard/agent');
    else if (role === 'gate' || role === 'entry') navigate('/dashboard/gate');
    else navigate('/dashboard/attendee');
  }, [user, navigate]);

  return (
    <div className="page dashboard-page fade-in">
      <SEO
        title="ReekTickets Dashboard"
        description="Redirecting you to your ReekTickets dashboard."
        ogTitle="ReekTickets Dashboard"
        ogDescription="Redirecting to the dashboard matching your role."
      />
      <div className="glass page-head">
        <h2>Redirecting to your dashboard...</h2>
        <p>If you are not redirected automatically, please refresh or login again.</p>
      </div>
    </div>
  );
}
 