import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

const TAGLINES = [
  'Sip. Smile. Repeat.',
  'Chai first, worries later.',
  'Good tea, good people.',
  'Break time is the best time.',
  'Fuel up, team!',
];

export function TopBar({ member, onSwitchMember }) {
  const [tagIdx, setTagIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTagIdx((i) => (i + 1) % TAGLINES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between gap-2">
      {/* Title + rotating quotes hidden for now; will come back later.
      <MotionConfig reducedMotion="user">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight text-ink truncate">
            Chai Time <span aria-hidden="true">☕</span>
          </h1>
          <div className="h-5 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={tagIdx}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="text-[13px] text-accent font-bold truncate"
              >
                {TAGLINES[tagIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </MotionConfig>
      */}
      {/* Greeting, "Not me?" and member name hidden; the Order tab now shows every member
          and anyone can edit any order.
      <div className="min-w-0">
        <p className="text-sm text-muted">
          Hey there
          <span aria-hidden="true"> · </span>
          <button
            type="button"
            onClick={onSwitchMember}
            className="underline hover:text-ink min-h-[var(--target)] -my-3 align-middle"
          >
            Not me?
          </button>
        </p>
        <h1 className="text-[26px] leading-tight text-ink truncate">{member?.name ?? '—'}</h1>
      </div>
      */}
    </header>
  );
}
