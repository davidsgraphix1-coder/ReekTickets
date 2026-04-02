/**
 * SMS Service - Calls the Railway backend to send SMS messages
 * Backend URL: https://reektickets-production.up.railway.app
 */

const BACKEND_BASE_URL =
  process.env.REACT_APP_SMS_BACKEND_URL ||
  "http://localhost:5000";

/**
 * Send SMS via the backend
 * @param {string} phone - Destination phone number
 * @param {string} message - Message text
 * @returns {Promise<Object>} Response from backend
 */
export const sendSMS = async (phone, message) => {
  if (!phone || !message) {
    throw new Error("Phone number and message are required");
  }

  try {
    console.log(`[SMS] Sending to ${phone} via ${BACKEND_BASE_URL}`);

    const response = await fetch(`${BACKEND_BASE_URL}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        message,
      }),
    });

    const data = await response.json();

    console.log(`[SMS] Response status: ${response.status}`, data);

    // Handle network errors
    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Backend error: HTTP ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("[SMS] Error:", error);
    
    // Better error messages
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Cannot reach SMS backend. Please check your connection."
      );
    }

    throw error;
  }
};

/**
 * Send SMS with ReekTickets prefix
 * @param {string} phone - User phone
 * @param {string} message - Custom message
 * @returns {Promise<Object>} Response
 */
export const sendTicketSMS = async (phone, message) => {
  const fullMessage = `ReekTickets: ${message}`;
  return sendSMS(phone, fullMessage);
};

/**
 * Send booking confirmation SMS
 */
export const sendBookingConfirmationSMS = async (phone, ticketCode) => {
  const message = `Your ticket code is: ${ticketCode}. View your ticket: ${window.location.origin}/ticket/${ticketCode}`;
  return sendTicketSMS(phone, message);
};

/**
 * Health check - verify SMS backend is working
 */
export const checkSMSBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
