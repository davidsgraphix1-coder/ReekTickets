import { motion } from 'framer-motion';
import { FaTachometerAlt, FaPlusCircle, FaCalendarAlt, FaExchangeAlt, FaChartLine, FaCog } from 'react-icons/fa';

const menuItems = [
  { label: 'Dashboard', icon: FaTachometerAlt },
  { label: 'Create Event', icon: FaPlusCircle },
  { label: 'My Events', icon: FaCalendarAlt },
  { label: 'Transactions', icon: FaExchangeAlt },
  { label: 'Reports', icon: FaChartLine },
  { label: 'Settings', icon: FaCog },
];

export default function Sidebar({ activeItem = 'Dashboard' }) {
  return (
    <motion.aside
      className="dashboard-sidebar"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="sidebar-brand">
        <div className="brand-badge">R</div>
        <div>
          <p className="brand-title">ReekTickets</p>
          <p className="brand-subtitle">SaaS dashboard</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;
          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">
                <Icon />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Need help?</p>
        <span>support@reektickets.com</span>
      </div>
    </motion.aside>
  );
}
