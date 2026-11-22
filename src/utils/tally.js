/** Derive drink totals and status counts from the member list (single source of truth) */
export function deriveTally(members) {
  const drinkMap = new Map();
  let ordered = 0;
  let skipping = 0;
  for (const m of members) {
    if (m.status === 'ordered') {
      ordered += 1;
      const item = m.order?.menuItem;
      if (item) {
        const entry = drinkMap.get(item._id) ?? {
          menuItem: { _id: item._id, name: item.name, emoji: item.emoji },
          total: 0,
        };
        entry.total += 1;
        drinkMap.set(item._id, entry);
      }
    } else if (m.status === 'skipped') {
      skipping += 1;
    }
  }
  return {
    members,
    drinks: [...drinkMap.values()],
    counts: {
      total: members.length,
      ordered,
      skipping,
      pending: members.length - ordered - skipping,
    },
  };
}

/** Apply a server `order:update` event to the member list; returns null if the member is unknown */
export function applyOrderEvent(members, evt) {
  const id = evt.type === 'cancelled' ? evt.memberId : evt.order?.member?._id;
  if (!id || !members.some((m) => m._id === id)) return null;
  const next =
    evt.type === 'ordered'
      ? { status: 'ordered', order: { menuItem: evt.order.menuItem, note: evt.order.note } }
      : evt.type === 'skipped'
        ? { status: 'skipped', order: null }
        : { status: 'pending', order: null };
  return members.map((m) => (m._id === id ? { ...m, ...next } : m));
}
