import { io } from 'socket.io-client';

// The dev agent can live on a different server (e.g. a VPS) than the main API.
// VITE_DEV_API_URL wins; without it the page uses the main API (VITE_API_URL).
const BASE = import.meta.env.VITE_DEV_API_URL || import.meta.env.VITE_API_URL || '';

/** Separate socket for the dev-agent stream, so it never touches the app's own connection. */
export const devSocket = io(BASE, {
  autoConnect: false,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
});

/** Calls /api/dev/*; sends the admin key (if any) as a Bearer token. */
async function call(method, path, key, body) {
  let res;
  try {
    res = await fetch(`${BASE}/api/dev${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error('Network error'), { network: true });
  }
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw Object.assign(new Error(data?.message || `HTTP ${res.status}`), { status: res.status });
  return data;
}

export const devApi = {
  status: () => call('GET', '/status'),
  list: (key) => call('GET', '/jobs', key).then((r) => r.data),
  get: (key, id) => call('GET', `/jobs/${id}`, key).then((r) => r.data),
  create: (key, prompt) => call('POST', '/jobs', key, { prompt }).then((r) => r.data),
  cancel: (key, id) => call('POST', `/jobs/${id}/cancel`, key).then((r) => r.data),
};
