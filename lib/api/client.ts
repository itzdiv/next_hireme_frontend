import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── In-flight GET deduplication ─────────────────────────────────────────────
// Concurrent requests for the exact same URL are coalesced into one HTTP call.
// The shared Promise resolves/rejects for all callers simultaneously.

const inFlight = new Map<string, Promise<unknown>>();

//axios get request is handled later and switched with dedup function 
const originalGet = apiClient.get.bind(apiClient);

// @ts-expect-error — we override the generic get to add dedup logic
apiClient.get = function dedupGet(url: string, config?: object) {
  //makes sure that save request but with different params is not clubbed as same one!
  const key = url + (config ? JSON.stringify(config) : '');

  const existing = inFlight.get(key);
  if (existing) return existing;

  const req = originalGet(url, config).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, req);
  return req;
};

// ─────────────────────────────────────────────────────────────────────────────

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Only redirect on 401 if user was previously authenticated
      // (i.e., had a token). Don't redirect for pages that just check profile etc.
      const hadToken = localStorage.getItem('auth_token');
      if (hadToken) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('active_company_id');
        // Only redirect if not already on an auth page
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
