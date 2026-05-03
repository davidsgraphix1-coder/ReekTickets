import React from 'react';
import styles from './ChatButton.module.css';
import { FaComments } from 'react-icons/fa';

export default function ChatButton({ onClick }) {
  return (
    <button
      className={styles.floatingChatButton}
      onClick={onClick}
      aria-label="Open support chat"
      title="Need Help?"
    >
      <span className={styles.iconWrap}>
        <FaComments size={28} />
      </span>
      <span className={styles.tooltip}>Need Help?</span>
    </button>
  );
}
