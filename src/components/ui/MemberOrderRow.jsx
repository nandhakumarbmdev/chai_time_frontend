import { motion } from 'framer-motion';
import { Check, Coffee } from 'lucide-react';
import { iconForDrink } from '../../utils/iconForDrink.js';

const PILL = {
  ordered: 'bg-accent-soft border-transparent text-ink',
  skipped: 'bg-surface-2 border-transparent text-muted',
  pending: 'border-dashed border-line text-muted',
};

/** Compact member tile; tapping it opens the drink sheet for that member. */
export function MemberOrderRow({ member, isYou = false, saving = false, onOpen, index = 0 }) {
  const ordered = member.status === 'ordered';
  const chosen = member.order?.menuItem ?? null;
  const Icon = chosen ? iconForDrink(chosen.name) : Coffee;
  const caption = chosen ? chosen.name : member.status === 'skipped' ? 'Skipping' : 'Pick a drink';

  return (
    <motion.li
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className="enter-fast"
      style={{ '--i': index }}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onOpen}
        disabled={saving}
        aria-label={`${member.name}, ${caption}. Edit order`}
        className={`w-full flex items-center gap-2 p-2 text-left min-h-[56px] bg-surface border-[1.5px] border-line hover:bg-surface-2
                    ${saving ? 'opacity-60' : ''} ${ordered ? 'border-accent' : ''}`}
        style={{ borderRadius: 'var(--radius-2)' }}
      >
        {/* Avatar: initial until they order, then a filled tick that pops in. */}
        <span
          className={`flex items-center justify-center w-9 h-9 shrink-0 font-bold transition-colors duration-200
                      ${ordered ? 'bg-accent text-accent-on shadow-sm' : 'bg-surface-2 text-accent'}`}
          style={{ borderRadius: 'var(--radius-1)' }}
          aria-hidden="true"
        >
          {ordered ? (
            <motion.span
              key="tick"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 16 }}
              className="flex"
            >
              <Check size={20} strokeWidth={3.2} />
            </motion.span>
          ) : (
            member.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink truncate">
            {member.name}
            {/* {isYou && <span className="ml-1 text-[11px] text-accent">(you)</span>} */}
          </span>
          {/* Pill under the name: filled = ordered, soft = skipping, dashed = nothing picked yet. */}
          <motion.span
            key={caption}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
            className={`mt-1 inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold leading-4 ${PILL[member.status] ?? PILL.pending}`}
          >
            <Icon size={12} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{caption}</span>
          </motion.span>
        </span>
      </motion.button>
    </motion.li>
  );
}
