import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import HeaderCard from './HeaderCard';
import StatsCards from './StatsCards';
import SectionBox from './SectionBox';
import { FaChartLine, FaTicketAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import './DashboardShell.css';

const roleMeta = {
  admin: {
    title: 'Admin Control Center',
    subtitle: 'Govern platform performance, reviews, and system-wide insights.',
    highlight: 'All admin actions, metrics and audit controls in one dashboard.',
  },
  organizer: {
    title: 'Organizer Command Hub',
    subtitle: 'Plan events, manage attendees, and publish campaigns with confidence.',
    highlight: 'A single workspace for planning, tracking, and promoting your events.',
  },
  vendor: {
    title: 'Vendor Sales Hub',
    subtitle: 'Track vendor applications, bookings, and revenue performance.',
    highlight: 'Stay on top of your marketplace presence and vendor operations.',
  },
  agent: {
    title: 'Agent Performance Panel',
    subtitle: 'Monitor referrals, commissions, and active event conversions.',
    highlight: 'Built to keep your sales pipeline moving with real-time momentum.',
  },
  attendee: {
    title: 'Attendee Experience',
    subtitle: 'View tickets, upcoming events, and support updates in one place.',
    highlight: 'The most intuitive way to stay connected to every event you love.',
  },
};

const quickStats = [
  { label: 'Active users', value: '14.2k', icon: FaUsers, color: 'purple' },
  { label: 'Tickets sold', value: '8.9k', icon: FaTicketAlt, color: 'blue' },
  { label: 'Event growth', value: '+26%', icon: FaChartLine, color: 'orange' },
  { label: 'Live events', value: '18', icon: FaCalendarAlt, color: 'green' },
];

const upcomingEvents = [
  { title: 'Sunset Beats Festival', date: 'May 18', attendees: '6.8k' },
  { title: 'Creative Workshops', date: 'May 22', attendees: '3.1k' },
  { title: 'Vendor Expo', date: 'May 28', attendees: '2.4k' },
];

const activityFeed = [
  { label: 'Revenue spike', description: 'Ticket revenue climbed 18% after last campaign.', time: '2h ago' },
  { label: 'New event live', description: 'Your “Spring Forward Conference” is now published.', time: '5h ago' },
  { label: 'Support note', description: 'A customer inquiry was routed to your inbox.', time: '1d ago' },
];

export default function DashboardShell() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('reek_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        setUser(null);
      }
    }
  }, []);

  const role = user?.role || 'attendee';
  const meta = roleMeta[role] || roleMeta.attendee;
  const displayName = user?.fullName || user?.name || 'ReekTickets Team';

  return (
    <div className="dashboard-shell">
      <Sidebar activeItem="Dashboard" />

      <div className="dashboard-main">
        <Navbar userName={displayName} />
        <div className="dashboard-page">
          <HeaderCard userName={displayName.split(' ')[0] || displayName} />

          <div className="dashboard-welcome-card">
            <div>
              <p className="welcome-subtitle">{meta.title}</p>
              <h2>{meta.subtitle}</h2>
              <p className="welcome-copy">{meta.highlight}</p>
            </div>
            <button type="button" className="ghost-button">View role summary</button>
          </div>

          <StatsCards />

          <div className="dashboard-grid">
            <SectionBox title="Core performance" subtitle="High-level metrics for your ReekTickets workspace.">
              <div className="quick-grid">
                {quickStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`quick-card quick-${item.color}`}>
                      <div className="quick-card-icon"><Icon /></div>
                      <div>
                        <p className="quick-title">{item.label}</p>
                        <p className="quick-value">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionBox>

            <SectionBox title="Upcoming events" subtitle="A snapshot of the next live experiences.">
              <div className="event-list">
                {upcomingEvents.map((event) => (
                  <article key={event.title} className="event-item">
                    <div>
                      <h4>{event.title}</h4>
                      <p>{event.attendees} attendees expected</p>
                    </div>
                    <span>{event.date}</span>
                  </article>
                ))}
              </div>
            </SectionBox>

            <SectionBox title="Recent activity" subtitle="What changed in the last 24 hours.">
              <div className="activity-list">
                {activityFeed.map((activity) => (
                  <div key={activity.label} className="activity-item">
                    <div>
                      <p className="activity-label">{activity.label}</p>
                      <p className="activity-copy">{activity.description}</p>
                    </div>
                    <span>{activity.time}</span>
                  </div>
                ))}
              </div>
            </SectionBox>
          </div>
        </div>
      </div>
    </div>
  );
}
