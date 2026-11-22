import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { api } from '../api/client.js';
import { Skeleton } from './Primitives.jsx';

function formatDate(date) {
  // date is "YYYY-MM-DD"; parse as local noon to avoid timezone day-shift
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function DayCard({ day }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[var(--target)] p-3 flex items-center gap-2 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink">{formatDate(day.date)}</p>
          <p className="text-xs text-muted">
            {day.ordered} ordered · {day.skipped} skipped
            {day.drinks.length > 0 && ` · ${day.drinks.map((d) => `${d.total} ${d.name}`).join(', ')}`}
          </p>
        </div>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={`text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1 border-t border-line pt-2">
          {day.people.map((p) => (
            <li key={p.name} className="flex items-center justify-between text-sm">
              <span className="text-ink">{p.name}</span>
              <span className="text-muted">
                {p.status === 'ordered' ? p.drink ?? 'Ordered' : 'Skipped'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HistoryView() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getHistory()
      .then((d) => setHistory(d.history))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-center text-muted py-6 text-sm">Could not load history.</p>;
  if (!history) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }
  if (history.length === 0) {
    return <p className="text-center text-muted py-6 text-sm">No past orders yet.</p>;
  }
  return (
    <div className="space-y-2">
      {history.map((day) => <DayCard key={day.date} day={day} />)}
    </div>
  );
}
