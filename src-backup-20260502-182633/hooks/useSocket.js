import { useEffect, useCallback, useRef } from 'react';
import { socket, connectSocket, disconnectSocket } from '../services/socket';

/**
 * Custom hook for Socket.io functionality
 * Manages socket connection lifecycle and provides easy event handling
 * 
 * @param {string} chatId - Optional chat ID for joining a specific chat room
 * @param {boolean} autoConnect - Whether to auto-connect on mount (default: true)
 * @returns {Object} Socket object and utility functions
 */
export function useSocket(chatId = null, autoConnect = true) {
  const eventListeners = useRef(new Map());

  // Connect to socket on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (autoConnect) {
      connectSocket();
    }

    return () => {
      // Cleanup listeners on unmount
      const listeners = eventListeners.current;
      if (listeners) {
        listeners.forEach((callback, eventName) => {
          socket.off(eventName, callback);
        });
        listeners.clear();
      }
    };
  }, [autoConnect]);

  // Join chat room if chatId is provided
  useEffect(() => {
    if (chatId && socket.connected) {
      socket.emit('join', chatId);

      return () => {
        socket.emit('leave', chatId);
      };
    }
  }, [chatId]);

  /**
   * Listen to a socket event with automatic cleanup
   */
  const on = useCallback((eventName, callback) => {
    if (eventListeners.current.has(eventName)) {
      socket.off(eventName, eventListeners.current.get(eventName));
    }
    socket.on(eventName, callback);
    eventListeners.current.set(eventName, callback);
  }, []);

  /**
   * Emit a socket event
   */
  const emit = useCallback((eventName, data) => {
    if (!socket.connected) {
      connectSocket();
    }
    socket.emit(eventName, data);
  }, []);

  /**
   * Remove listener for a specific event
   */
  const off = useCallback((eventName) => {
    if (eventListeners.current.has(eventName)) {
      socket.off(eventName, eventListeners.current.get(eventName));
      eventListeners.current.delete(eventName);
    }
  }, []);

  /**
   * Send a user message to a chat
   */
  const sendMessage = useCallback((chatId, messageText) => {
    emit('userMessage', {
      chatId,
      message: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: messageText,
        timestamp: new Date().toISOString()
      }
    });
  }, [emit]);

  /**
   * Send an admin message to a chat
   */
  const sendAdminMessage = useCallback((chatId, messageText) => {
    emit('adminMessage', {
      chatId,
      message: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: messageText,
        timestamp: new Date().toISOString()
      }
    });
  }, [emit]);

  return {
    socket,
    connected: socket.connected,
    on,
    off,
    emit,
    sendMessage,
    sendAdminMessage,
    connect: connectSocket,
    disconnect: disconnectSocket
  };
}
