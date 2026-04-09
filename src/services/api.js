import API_BASE from '../config/api';

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return { message: 'Invalid API response' };
  }
};

const safeFetch = async (url, opts) => {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const json = await safeJson(res);
      return json;
    }
    return await safeJson(res);
  } catch (error) {
    console.error('Fetch error:', error);
    return { message: 'Network error: Please check your connection' };
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('reek_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function signup(data) {
  return safeFetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function verifyOtp(data) {
  return safeFetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function resendOtp(data) {
  return safeFetch(`${API_BASE}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function login(data) {
  return safeFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(data) {
  return safeFetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function verifyResetCode(data) {
  return safeFetch(`${API_BASE}/auth/verify-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data) {
  return safeFetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch (error) {
    return [];
  }
}

export async function fetchEvent(id) {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error('Event not found');
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchTicket(id, code) {
  try {
    const token = localStorage.getItem('reek_token');
    const query = code ? `?code=${encodeURIComponent(code)}` : '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/tickets/${id}${query}`, { headers });
    if (!res.ok) throw new Error('Ticket not found');
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchMyTickets() {
  try {
    const res = await fetch(`${API_BASE}/tickets`, {
      headers: { ...getAuthHeader() },
    });
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not fetch tickets' };
  }
}

export async function createEvent(payload) {
  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return await safeJson(res);
  } catch {
    return { message: 'Network error: cannot create event' };
  }
}

export async function initPaystack(payload) {
  try {
    const res = await fetch(`${API_BASE}/payments/paystack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not initialize payment' };
  }
}

export async function withdrawFunds(amount) {
  try {
    const res = await fetch(`${API_BASE}/payments/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ amount }),
    });
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not process withdrawal' };
  }
}

export async function requestOrganizerPayout(amount, bankDetails) {
  try {
    const res = await fetch(`${API_BASE}/payments/organizer/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ amount, bankDetails }),
    });
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not process payout request' };
  }
}

export async function getOrganizerPayouts() {
  try {
    const res = await fetch(`${API_BASE}/payments/organizer/payouts`, {
      headers: getAuthHeader(),
    });
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not fetch payout history' };
  }
}

export async function getPaymentSummary() {
  try {
    const res = await fetch(`${API_BASE}/payments/summary`, {
      headers: getAuthHeader(),
    });
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not fetch payment summary' };
  }
}

export async function verifyPayment(reference) {
  try {
    const res = await fetch(`${API_BASE}/payments/verify?reference=${encodeURIComponent(reference)}`);
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not verify payment' };
  }
}

export async function sendNaloSms(payload) {
  const { to, message } = payload || {};
  if (!to || !message) {
    return { message: 'Missing recipient phone number or message content.', success: false };
  }
  
  try {
    console.log('[SMS] Sending to', to);
    // Use backend SMS send endpoint for messages
    const res = await fetch(`${API_BASE}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: to,
        message: message,
      }),
    });
    
    const result = await safeJson(res);
    console.log('[SMS] Response:', result);
    return result.success 
      ? { message: result.message || 'SMS sent successfully', success: true }
      : { message: result.message || 'SMS delivery failed', success: false };
  } catch (error) {
    console.error('[SMS] Backend error:', error);
    return { message: `Network error: ${error.message}`, success: false };
  }
}

export async function verifyTicketCode(ticketId, code) {
  if (!ticketId || !code) {
    throw new Error('Ticket ID and access code are required.');
  }
  return fetchTicket(ticketId, code);
}
