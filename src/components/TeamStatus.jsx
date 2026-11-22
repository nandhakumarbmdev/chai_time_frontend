import { motion } from 'framer-motion';
import { Skeleton } from './Primitives.jsx';

const STATUS_CONFIG = {
  ordered: { label: 'Ordered', bg: 'bg-green-100 dark:bg-green-900/30', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400' },
  skipped: { label: 'Skipping', bg: 'bg-gray-100 dark:bg-gray-800', dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400' },
  pending: { label: 'Pending', bg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-700 dark:text-amber-400' },
};

export function TeamStatus({ members, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <p className="text-center text-tea-400 py-6 text-sm">
        No team members yet. Ask someone to add themselves!
      </p>
    );
  }

  // Sort: ordered first, then pending, then skipped
  const sorted = [...members].sort((a, b) => {
    const order = { ordered: 0, pending: 1, skipped: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-2">
      {sorted.map((m, i) => {
        const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending;
        return (
          <motion.div
            key={m._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${cfg.bg} transition-colors`}
          >
            {/* Status dot */}
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />

            {/* Name */}
            <span className="flex-1 font-medium text-tea-800 dark:text-tea-100 text-sm">{m.name}</span>

            {/* Order detail */}
            {m.status === 'ordered' && m.order?.menuItem && (
              <span className="text-xs text-tea-600 dark:text-tea-400 flex items-center gap-1">
                {m.order.menuItem.emoji} {m.order.menuItem.name}
              </span>
            )}

            {/* Status badge */}
            <span className={`text-xs font-semibold ${cfg.text} shrink-0`}>{cfg.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
