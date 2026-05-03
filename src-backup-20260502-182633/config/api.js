// API Configuration
// This is the single source of truth for your API base URL

const normalizeApiUrl = (url) => {
  if (!url) return url;
  return url.endsWith('/api') ? url : `${url.replace(/\/+$/, '')}/api`;
};

const defaultApiOrigin = typeof window !== 'undefined' && window.location ? `${window.location.origin}/api` : 'http://localhost:5000/api';
const rawApiBase = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE;
const API_BASE = normalizeApiUrl(rawApiBase) || defaultApiOrigin;

export default API_BASE;
