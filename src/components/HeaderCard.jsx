import { motion } from 'framer-motion';

export default function HeaderCard({ userName = 'User' }) {
  return (
    <motion.section
      className="header-card"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div>
        <p className="header-label">Good Morning, {userName} 👋</p>
        <h2>Here’s a quick snapshot of your events and attendees.</h2>
      </div>

      <div className="header-actions">
        <button type="button" className="primary-button">Create Event</button>
        <button type="button" className="secondary-button">My Events</button>
        <button type="button" className="secondary-button">Orders</button>
      </div>
    </motion.section>
  );
}
