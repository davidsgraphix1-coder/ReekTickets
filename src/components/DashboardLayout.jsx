import { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import HeaderCard from './HeaderCard';
import StatsCards from './StatsCards';
import SectionBox from './SectionBox';
import './DashboardLayout.css';

const defaultStats = [
  { label: 'Events Added', value: '128', detail: '12 new this week', variant: 'orange' },
  { label: 'Published Events', value: '84', detail: '58% live now', variant: 'dark' },
  { label: 'Upcoming Events', value: '46', detail: '10 this month', variant: 'green' },
  { label: 'Event Dates', value: '152', detail: 'Next 90 days', variant: 'red' },
];

const defaultOrderSummary = [
  { label: 'New orders', value: '1,420', caption: 'Fresh sales recorded' },
  { label: 'Conversion rate', value: '8.4%', caption: 'Growing engagement' },
  { label: 'Revenue', value: 'GH₵ 74,500', caption: 'Month-to-date' },
  { label: 'Attendee growth', value: '18.2%', caption: 'Compared to last month' },
];

const defaultActivity = [
  { title: 'Ticket order completed', subtitle: '120 tickets processed', time: '2m ago' },
  { title: 'New event published', subtitle: 'Jazz Night with 320 attendees', time: '18m ago' },
  { title: 'Payment settled', subtitle: 'GH₵ 9,800 transferred', time: '42m ago' },
  { title: 'New support request', subtitle: 'User asked about refunds', time: '1h ago' },
];

const defaultActions = [
  { label: 'Create Event', type: 'primary' },
  { label: 'My Events', type: 'faded' },
  { label: 'Orders', type: 'ghost' },
];

export default function DashboardLayout({ pageTitle, userName, roleName, stats = defaultStats, summaryItems = defaultOrderSummary, activityItems = defaultActivity, actions = defaultActions }) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = pageTitle || `${roleName || 'Dashboard'} Panel`;
  const greeting = `Good Morning, ${userName || roleName || 'ReekTickets User'} 👋`;
  const subtitle = 'Here’s a quick snapshot of your events and attendees.';

  const headerButtons = useMemo(() => actions.map((item) => ({ ...item })), [actions]);

  return (
    <div className={`dashboard-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar active={activeSection} onSelect={setActiveSection} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-frame">
        <Navbar userName={userName || roleName || 'User'} onMenuClick={() => setSidebarOpen(true)} />

        <main className="dashboard-main">
          <HeaderCard title={title} greeting={greeting} subtitle={subtitle} buttons={headerButtons} />

          <StatsCards items={stats} />

          <div className="section-grid">
            <SectionBox title="Order Summary" subtitle="Live metrics for recent orders">
              <div className="summary-grid">
                {summaryItems.map((item) => (
                  <div key={item.label} className="summary-card">
                    <span className="summary-label">{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>{item.caption}</p>
                  </div>
                ))}
              </div>
            </SectionBox>

            <SectionBox title="Recent Activity" subtitle="Latest actions across your workspace">
              <div className="activity-list">
                {activityItems.map((item) => (
                  <div key={item.title} className="activity-item">
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.subtitle}</p>
                    </div>
                    <span>{item.time}</span>
                  </div>
                ))}
              </div>
            </SectionBox>
          </div>
        </main>
      </div>
    </div>
  );
}
