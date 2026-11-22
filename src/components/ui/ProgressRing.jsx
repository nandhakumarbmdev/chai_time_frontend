const SIZE = 64;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function ProgressRing({ counts }) {
  if (!counts) return null;
  const { total = 0, ordered = 0, skipping = 0, pending = 0 } = counts;
  const responded = ordered + skipping;
  const pct = total > 0 ? responded / total : 0;

  const legend = [
    { label: 'Ordered', value: ordered, dot: 'bg-accent' },
    { label: 'Pending', value: pending, dot: 'bg-muted' },
  ];

  return (
    <section
      aria-label="Team responses"
      className="enter-fast flex items-center gap-4 p-4 bg-surface border-[1.5px] border-line"
      style={{ '--i': 0, borderRadius: 'var(--radius-2)' }}
    >
      <div
        className="relative shrink-0"
        style={{ width: SIZE, height: SIZE }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={responded}
        aria-label={`${responded} of ${total} responded`}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden="true">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            className="ring-draw"
            style={{ '--ring-circ': C, transition: 'stroke-dashoffset 300ms ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink tabular-nums">
          {responded}/{total}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-bold text-ink">
          {responded} of {total} responded
        </p>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
          {legend.map(({ label, value, dot }) => (
            <li key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden="true" />
              {label} <span className="font-bold text-ink tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
