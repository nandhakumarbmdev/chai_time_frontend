import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../api/client.js';
import { socket } from '../api/socket.js';
import { deriveTally, applyOrderEvent } from '../utils/tally.js';
import toast from 'react-hot-toast';

const SNAPSHOT_KEY = 'breakbuddy_snapshot';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/** Last known members + menu, so a reload paints instantly. Only valid for the same day. */
function readSnapshot() {
  try {
    const snap = JSON.parse(localStorage.getItem(SNAPSHOT_KEY));
    if (snap?.day === today() && Array.isArray(snap.members) && Array.isArray(snap.menu)) return snap;
  } catch {}
  return null;
}

export function useBreakBuddy(memberId) {
  const [snapshot] = useState(readSnapshot);
  const [session, setSession] = useState(null);
  const [members, setMembers] = useState(snapshot?.members ?? null);
  const [menu, setMenu] = useState(snapshot?.menu ?? []);
  const [loading, setLoading] = useState(!snapshot);
  const [connected, setConnected] = useState(false);

  // Refs mirror state so optimistic writes and socket events can read the latest value synchronously
  const membersRef = useRef(members);
  const menuRef = useRef(menu);
  const tallySeq = useRef(0); // latest-wins guard for tally fetches
  const pending = useRef(0); // optimistic writes in flight
  const stale = useRef(false); // a write failed or a fetch was held back; resync when idle

  const commit = useCallback((next) => {
    membersRef.current = next;
    setMembers(next);
  }, []);

  const refreshTally = useCallback(async () => {
    const seq = ++tallySeq.current;
    const data = await api.getTally();
    if (seq !== tallySeq.current) return; // superseded by a newer fetch or a socket event
    if (pending.current > 0) {
      // Applying this would clobber an optimistic update that the server hasn't seen yet
      stale.current = true;
      return;
    }
    commit(data.members);
  }, [commit]);

  const fetchAll = useCallback(async () => {
    // Independent requests: the list renders as soon as the tally and menu are in
    api.getToday().then((d) => setSession(d.session)).catch(() => {});
    try {
      await Promise.all([
        refreshTally(),
        api.getMenu().then((d) => {
          menuRef.current = d.items;
          setMenu(d.items);
        }),
      ]);
    } catch (err) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [refreshTally]);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Persist the latest data for the next visit
  useEffect(() => {
    if (!members) return;
    try {
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ day: today(), members, menu }));
    } catch {}
  }, [members, menu]);

  // Socket.IO
  useEffect(() => {
    socket.connect();

    let hasConnected = false;
    const resync = () => refreshTally().catch(() => {});

    const onConnect = () => {
      setConnected(true);
      // Events missed while offline are never replayed, so reconcile after a reconnect
      if (hasConnected) resync();
      hasConnected = true;
    };
    const onDisconnect = () => setConnected(false);
    const onUpdate = (evt) => {
      const next = membersRef.current && applyOrderEvent(membersRef.current, evt);
      if (next) {
        tallySeq.current++; // an in-flight fetch may predate this event
        commit(next);
      } else {
        resync(); // unknown member (e.g. just added): fall back to a fetch
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && resync();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('order:update', onUpdate);
    window.addEventListener('online', resync);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('order:update', onUpdate);
      window.removeEventListener('online', resync);
      document.removeEventListener('visibilitychange', onVisible);
      socket.disconnect();
    };
  }, [refreshTally, commit]);

  const tally = useMemo(() => (members ? deriveTally(members) : null), [members]);

  // My current order
  const myOrder = tally?.members?.find((m) => m._id === memberId)?.order ?? null;
  const myStatus = tally?.members?.find((m) => m._id === memberId)?.status ?? 'pending';

  /**
   * Show the change immediately, then confirm with the server. On failure only this member is
   * rolled back, and the list is re-fetched once idle so the UI never drifts from the server.
   */
  const mutate = useCallback(
    async (targetId, patch, call, { ignoreNotFound = false } = {}) => {
      const list = membersRef.current;
      const prev = list?.find((m) => m._id === targetId);
      if (!prev) throw new Error('Member not found');

      commit(list.map((m) => (m._id === targetId ? { ...m, ...patch } : m)));
      pending.current++;
      try {
        await call();
      } catch (err) {
        stale.current = true;
        // Cancelling something that's already gone is the outcome the user wanted
        if (!(ignoreNotFound && err.status === 404)) {
          commit(membersRef.current.map((m) => (m._id === targetId ? prev : m)));
          throw err;
        }
      } finally {
        pending.current--;
        if (pending.current === 0 && stale.current) {
          stale.current = false;
          refreshTally().catch(() => {});
        }
      }
    },
    [commit, refreshTally]
  );

  const placeOrder = useCallback(
    ({ memberId: targetId = memberId, menuItemId, sugarLevel, note }) => {
      const item = menuRef.current.find((i) => i._id === menuItemId);
      if (!item) return Promise.reject(new Error('Menu item not found'));
      return mutate(
        targetId,
        {
          status: 'ordered',
          order: { menuItem: { _id: item._id, name: item.name, emoji: item.emoji }, note: note ?? '' },
        },
        () => api.placeOrder({ memberId: targetId, menuItemId, sugarLevel, note })
      );
    },
    [memberId, mutate]
  );

  const skipOrder = useCallback(
    (targetId = memberId) =>
      mutate(targetId, { status: 'skipped', order: null }, () => api.skipOrder(targetId)),
    [memberId, mutate]
  );

  const cancelOrder = useCallback(
    (targetId = memberId) =>
      mutate(targetId, { status: 'pending', order: null }, () => api.cancelOrder(targetId), {
        ignoreNotFound: true,
      }),
    [memberId, mutate]
  );

  const getYesterday = useCallback(() => api.getYesterday(memberId), [memberId]);

  return {
    session,
    tally,
    menu,
    loading,
    connected,
    myOrder,
    myStatus,
    placeOrder,
    skipOrder,
    cancelOrder,
    getYesterday,
    refresh: fetchAll,
  };
}
