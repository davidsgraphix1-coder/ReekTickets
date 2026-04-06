import { motion } from 'framer-motion';
import { FaRegCalendarCheck, FaRocket, FaClock, FaCalendarDay } from 'react-icons/fa';

const stats = [
  { label: 'Events Added', value: '128', icon: FaRegCalendarCheck, theme: 'orange' },
  { label: 'Published Events', value: '82', icon: FaRocket, theme: 'dark' },
  { label: 'Upcoming Events', value: '54', icon: FaClock, theme: 'green' },
  { label: 'Event Dates', value: '24', icon: FaCalendarDay, theme: 'red' },
];

export default function StatsCards() {
  return (
    <section className="stats-grid">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.article
            className={`stat-card stat-${item.theme}`}
            key={item.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <div className="stat-card-icon">
              <Icon />
            </div>
            <div>
              <p className="stat-label">{item.label}</p>
              <p className="stat-value">{item.value}</p>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
