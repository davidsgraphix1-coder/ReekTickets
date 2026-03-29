const API_BASE = process.env.REACT_APP_API_BASE || 'https://reektickets-production.up.railway.app/api';
const API_FALLBACK = process.env.REACT_APP_API_FALLBACK || 'http://localhost:5000/api';

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
    if (url.startsWith(API_BASE) && API_FALLBACK && API_FALLBACK !== API_BASE) {
      try {
        const backupUrl = url.replace(API_BASE, API_FALLBACK);
        const res = await fetch(backupUrl, opts);
        return await safeJson(res);
      } catch (e) {
        return { message: 'Network error: could not reach primary or fallback API' };
      }
    }
    return { message: 'Network error: could not reach API' };
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

export async function login(data) {
  return safeFetch(`${API_BASE}/auth/login`, {
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

export async function fetchTicket(id) {
  try {
    const token = localStorage.getItem('reek_token');
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Ticket not found');
    return await res.json();
  } catch (error) {
    throw error;
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

export async function verifyPayment(reference) {
  try {
    const res = await fetch(`${API_BASE}/payments/verify?reference=${encodeURIComponent(reference)}`);
    return await safeJson(res);
  } catch {
    return { message: 'Network error: could not verify payment' };
  }
}
