import { motion } from 'framer-motion';

export default function SectionBox({ title, subtitle, children }) {
  return (
    <motion.section
      className="section-box"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <span className="section-pill">Updated</span>
      </div>
      {children}
    </motion.section>
  );
}
