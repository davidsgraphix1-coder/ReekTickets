import { motion } from 'framer-motion';
import { FaBell, FaCog } from 'react-icons/fa';

export default function Navbar({ userName = 'User' }) {
  return (
    <motion.header
      className="dashboard-navbar"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="navbar-left">
        <div className="navbar-badge">Dashboard</div>
        <h1>Welcome back, {userName}</h1>
      </div>

      <div className="navbar-actions">
        <button type="button" className="icon-button">
          <FaBell />
          <span className="notification-dot" />
        </button>
        <button type="button" className="icon-button">
          <FaCog />
        </button>
        <div className="profile-pill">
          <span>RK</span>
        </div>
      </div>
    </motion.header>
  );
}
