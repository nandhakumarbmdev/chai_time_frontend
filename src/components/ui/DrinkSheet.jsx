import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { iconForDrink } from '../../utils/iconForDrink.js';

/** Bottom sheet for editing one member's order. Picking a drink saves and closes. */
export function DrinkSheet({ member, menu, saving, onPick, onClear, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const chosenId = member.order?.menuItem?._id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Order for ${member.name}`}
    >
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: 48 }}
        animate={{ y: 0 }}
        exit={{ y: 48 }}
        transition={{ type: 'spring', stiffness: 520, damping: 38 }}
        className="relative w-full max-w-[480px] bg-bg p-5 pb-8"
        style={{ borderRadius: 'var(--radius-3) var(--radius-3) 0 0' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg text-ink">{member.name}'s drink</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="w-11 h-11 flex items-center justify-center text-muted">
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>
        <div role="radiogroup" aria-label={`Drink for ${member.name}`} className="grid grid-cols-2 gap-2">
          {menu.map((item) => {
            const selected = chosenId === item._id;
            const Icon = iconForDrink(item.name);
            return (
              <motion.button
                key={item._id}
                whileTap={{ scale: 0.94 }}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={saving}
                onClick={() => onPick(item._id)}
                className={`flex items-center gap-2 px-3 min-h-[52px] border-[1.5px] font-bold text-sm text-left
                  ${selected ? 'bg-accent text-accent-on border-accent' : 'bg-surface text-ink border-line hover:bg-surface-2'}`}
                style={{ borderRadius: 'var(--radius-2)' }}
              >
                {selected ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={1.8} />}
                <span className="truncate">{item.name}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn btn-secondary flex-1 min-h-[48px] flex items-center justify-center gap-1" disabled={saving || member.status === 'pending'} onClick={onClear}>
            <X size={16} strokeWidth={1.8} /> Clear
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
