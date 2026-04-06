import React, { useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';
import { FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa';

export default function ChatWindow({
  messages = [],
  onSend,
  input,
  setInput,
  onFile,
  typing,
  disabled
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.sender === 'user' ? styles.userMsg : styles.adminMsg}
          >
            <div className={styles.bubble}>{msg.text}</div>
            {msg.fileUrl && (
              <div className={styles.filePreview}>
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                  {msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)
                    ? <img src={msg.fileUrl} alt="attachment" className={styles.fileImg} />
                    : <span>📎 File</span>}
                </a>
              </div>
            )}
            <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
        {typing && (
          <div className={styles.adminMsg}>
            <div className={styles.bubble}>
              <span className={styles.typingDots}>
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className={styles.inputRow}
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) onSend(input);
        }}
      >
        <button type="button" className={styles.emojiBtn} tabIndex={-1} title="Emoji" disabled={disabled}>
          <FaSmile />
        </button>
        <button type="button" className={styles.fileBtn} tabIndex={-1} title="Attach file" disabled={disabled}>
          <FaPaperclip />
          <input type="file" className={styles.fileInput} onChange={onFile} disabled={disabled} />
        </button>
        <input
          className={styles.input}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={disabled}
        />
        <button type="submit" className={styles.sendBtn} disabled={!input.trim() || disabled}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
