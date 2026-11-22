import { Check } from 'lucide-react';
import { iconForDrink } from '../../utils/iconForDrink.js';

export function HeroOrderCard({ name, description }) {
  const Icon = iconForDrink(name);
  return (
    <section
      aria-label="Your order today"
      className="enter flex items-center gap-3 p-5 bg-accent text-accent-on"
      style={{ '--i': 0, borderRadius: 'var(--radius-3)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest opacity-90">Your order today</p>
        <p className="font-heading text-[30px] leading-tight mt-1 truncate">{name}</p>
        {description && <p className="text-sm opacity-90 mt-0.5">{description}</p>}
        <span className="pop-in inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-deep text-on-deep text-xs font-bold">
          <Check size={14} strokeWidth={1.8} aria-hidden="true" />
          Confirmed
        </span>
      </div>
      <div
        className="flex items-center justify-center w-[72px] h-[72px] shrink-0 bg-deep text-accent"
        style={{ borderRadius: 'var(--radius-2)' }}
        aria-hidden="true"
      >
        <Icon size={36} strokeWidth={1.8} className="float" />
      </div>
    </section>
  );
}
