import { motion } from 'framer-motion';

export function SteamingCup({ size = 48 }) {
  return (
    <div className="relative inline-flex items-end justify-center" style={{ width: size, height: size * 1.4 }}>
      {/* Steam strands */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1.5">
        <span className="block w-0.5 h-4 rounded-full bg-tea-300 dark:bg-tea-500 animate-steam-1 opacity-0" />
        <span className="block w-0.5 h-4 rounded-full bg-tea-300 dark:bg-tea-500 animate-steam-2 opacity-0" />
        <span className="block w-0.5 h-4 rounded-full bg-tea-300 dark:bg-tea-500 animate-steam-3 opacity-0" />
      </div>
      {/* Cup emoji */}
      <span style={{ fontSize: size }} className="select-none leading-none">☕</span>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-tea-100 dark:bg-tea-800 ${className}`}
    />
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-tea-100 text-tea-800 dark:bg-tea-800 dark:text-tea-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function AnimatedCounter({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="tabular-nums"
    >
      {value}
    </motion.span>
  );
}

