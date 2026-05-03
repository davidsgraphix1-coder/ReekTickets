import React, { useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';
import { FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa';

export default function ChatWindow({
  messages = [],
  onSend,
  input,
  setInput,
  onFile,
  onEmojiToggle,
  emojiOpen,
  emojiOptions = [],
  onEmojiSelect,
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
            key={msg.id || i}
            className={msg.sender === 'user' ? styles.userMsg : styles.adminMsg}
          >
            <div className={styles.bubble}>
              {msg.text}
              {msg.emoji && <span style={{ marginLeft: 6 }}>{msg.emoji}</span>}
            </div>
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
        <div style={{ position: 'relative' }}>
          <button type="button" className={styles.emojiBtn} onClick={onEmojiToggle} title="Emoji" disabled={disabled}>
            <FaSmile />
          </button>
          {emojiOpen && (
            <div className={styles.emojiPicker}>
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={styles.emojiOption}
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className={styles.fileBtn} tabIndex={-1} title="Attach file" disabled={disabled}>
          <FaPaperclip />
          <input type="file" accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className={styles.fileInput} onChange={onFile} disabled={disabled} />
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
