import { Check } from 'lucide-react';
import { iconForDrink } from '../../utils/iconForDrink.js';

export function DrinkRow({ item, selected, onSelect, index = 0, disabled = false }) {
  const Icon = iconForDrink(item.name);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onSelect(item._id)}
      className={`enter lift w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''} flex items-center gap-3 p-3 text-left border-[1.5px]
                  ${selected ? 'bg-surface border-accent' : 'bg-surface border-line hover:bg-surface-2'}`}
      style={{ '--i': index, borderRadius: 'var(--radius-2)' }}
    >
      <span
        className={`flex items-center justify-center w-11 h-11 shrink-0 transition-colors duration-150 ${
          selected ? 'bg-accent text-accent-on' : 'bg-surface-2 text-accent'
        }`}
        style={{ borderRadius: 'var(--radius-1)' }}
        aria-hidden="true"
      >
        <Icon size={22} strokeWidth={1.8} fill={selected ? 'currentColor' : 'none'} fillOpacity={selected ? 0.3 : 0} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-ink">{item.name}</span>
        {item.description && <span className="block text-[13px] text-muted">{item.description}</span>}
      </span>
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 border-2 transition-colors duration-150 ${
          selected ? 'bg-accent border-accent text-accent-on' : 'border-line'
        }`}
        aria-hidden="true"
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}
