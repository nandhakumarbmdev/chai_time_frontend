const BASE = import.meta.env.VITE_API_URL || '';

// Generous: a cold-started Render instance can take ~30s to wake up
const TIMEOUT_MS = 30_000;

async function once(method, path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
  } catch (err) {
    const e = new Error(err.name === 'AbortError' ? 'Request timed out' : 'Network error');
    e.network = true;
    throw e;
  } finally {
    clearTimeout(timer);
  }

  // An error page (502 etc.) is not JSON; don't surface a parse error to the user
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok || !data?.success) {
    const e = new Error(data?.message || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return data;
}

async function req(method, path, body) {
  try {
    return await once(method, path, body);
  } catch (err) {
    // Reads are safe to retry once on a network failure or a 5xx
    if (method === 'GET' && (err.network || err.status >= 500)) return once(method, path, body);
    throw err;
  }
}

export const api = {
  getToday: () => req('GET', '/api/session/today'),
  getTally: () => req('GET', '/api/session/tally'),
  getHistory: () => req('GET', '/api/session/history'),
  getMembers: () => req('GET', '/api/members'),
  createMember: (name) => req('POST', '/api/members', { name }),
  getMenu: () => req('GET', '/api/menu'),
  placeOrder: (body) => req('POST', '/api/orders', body),
  skipOrder: (memberId) => req('POST', '/api/orders/skip', { memberId }),
  cancelOrder: (memberId) =>
    req('DELETE', `/api/orders/my-order?memberId=${encodeURIComponent(memberId)}`),
  getYesterday: (memberId) =>
    req('GET', `/api/orders/yesterday?memberId=${encodeURIComponent(memberId)}`),
};
