import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { Skeleton } from './Primitives.jsx';
import { DrinkSheet } from './ui/DrinkSheet.jsx';
import { MemberOrderRow } from './ui/MemberOrderRow.jsx';
import { ProgressRing } from './ui/ProgressRing.jsx';
import { useCountdown } from '../hooks/useCountdown.js';

const STATUS_RANK = { pending: 0, ordered: 1, skipped: 2 };

export function OrderPanel({
  menu,
  session,
  members,
  currentMemberId,
  counts,
  onOrder,
  onCancel,
  loading,
}) {
  const [openId, setOpenId] = useState(null);
  const [savingIds, setSavingIds] = useState([]);
  const inflight = useRef(new Set()); // synchronous double-tap guard (state lags a render)
  const { display: countdown } = useCountdown(session);
  // TEMP (testing): cutoff ignored. Restore the line below before shipping.
  // const locked = Boolean(session?.pastCutoff) || countdown === 'Locked';
  const locked = false;

  // action() updates the UI optimistically before it awaits the server, so the sheet
  // closes right away; if the server rejects, the change is rolled back and an error shows.
  function run(memberId, action, successMsg) {
    if (locked) return toast.error('Ordering closed at 7:00 PM');
    if (inflight.current.has(memberId)) return;
    inflight.current.add(memberId);
    setSavingIds((ids) => [...ids, memberId]);

    const done = action();
    setOpenId(null);
    try {
      navigator.vibrate?.(10); // light haptic tap on supported mobile browsers
    } catch {}
    toast.success(successMsg);

    done
      .catch((err) => toast.error(`${err.message || 'Failed to update order'} — change reverted`))
      .finally(() => {
        inflight.current.delete(memberId);
        setSavingIds((ids) => ids.filter((id) => id !== memberId));
      });
  }

  if (loading) {
    return (
      <div className="space-y-[14px]">
        <Skeleton className="h-[96px]" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[68px]" />
        ))}
      </div>
    );
  }

  // Alphabetical by name (case-insensitive, so the list doesn't jump when orders change).
  const sorted = [...(members ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
  // Previous order: current member first, then pending, ordered, skipping.
  // const sorted = [...(members ?? [])].sort((a, b) => {
  //   if (a._id === currentMemberId) return -1;
  //   if (b._id === currentMemberId) return 1;
  //   return (STATUS_RANK[a.status] ?? 0) - (STATUS_RANK[b.status] ?? 0) || a.name.localeCompare(b.name);
  // });

  const openMember = sorted.find((m) => m._id === openId);

  return (
    <MotionConfig reducedMotion="user">
    <div className="space-y-[14px]">
      <ProgressRing counts={counts} />

      {/* {locked && (
        <p role="status" className="card p-4 font-bold text-ink">
          Ordering closed at 7:00 PM
        </p>
      )} */}

      <h2 className="enter-fast text-xl text-ink pt-1" style={{ '--i': 1 }}>
        Everyone's drinks
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {sorted.map((m, i) => (
          <MemberOrderRow
            key={m._id}
            index={3 + i}
            member={m}
            isYou={m._id === currentMemberId}
            saving={savingIds.includes(m._id)}
            onOpen={() => !locked && setOpenId(m._id)}
          />
        ))}
      </ul>

      <AnimatePresence>
      {openMember && (
        <DrinkSheet
          key="drink-sheet"
          member={openMember}
          menu={menu}
          saving={savingIds.includes(openMember._id)}
          onClose={() => setOpenId(null)}
          onPick={(menuItemId) =>
            run(
              openMember._id,
              () => onOrder({ memberId: openMember._id, menuItemId }),
              `${openMember.name}'s order saved`
            )
          }
          onClear={() =>
            run(
              openMember._id,
              () => onCancel(openMember._id),
              `${openMember.name}'s order cleared`
            )
          }
        />
      )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}
