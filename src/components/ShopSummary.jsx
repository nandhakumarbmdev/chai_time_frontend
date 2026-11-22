import { Skeleton } from './Primitives.jsx';

function Stat({ label, value }) {
  return (
    <div className="flex-1 rounded-[var(--radius-1)] bg-surface-2 py-2 text-center">
      <p className="text-xl font-bold text-ink tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function NameList({ label, members }) {
  if (!members.length) return null;
  return (
    <p className="text-sm text-muted">
      <span className="font-bold text-ink">{label} ({members.length}):</span>{' '}
      {members.map((m) => m.name).join(', ')}
    </p>
  );
}

export function ShopSummary({ tally, session, loading }) {
  if (loading) return <Skeleton className="h-40" />;

  const { drinks = [], members = [], counts } = tally || {};
  const ordered = members.filter((m) => m.status === 'ordered');
  const pending = members.filter((m) => m.status === 'pending');

  if (ordered.length === 0) {
    return (
      <div className="text-center py-6 text-muted text-sm">
        No orders yet. Be the first! ☕
      </div>
    );
  }

  const final = Boolean(session?.pastCutoff);
  const groups = [...drinks].sort((a, b) => b.total - a.total);

  return (
    <div className="card p-4 space-y-4">
      <p role="status" className="text-sm font-bold text-ink">
        {final
          ? 'Final order'
          : pending.length > 0
            ? `Still open · waiting on ${pending.length} ${pending.length === 1 ? 'person' : 'people'}`
            : 'Everyone has responded'}
      </p>

      <div className="flex gap-2">
        <Stat label="Ordered" value={counts?.ordered ?? ordered.length} />
        <Stat label="Pending" value={counts?.pending ?? pending.length} />
      </div>

      {/* Shop order: drink totals */}
      <div className="space-y-3">
        {groups.map((d) => {
          return (
            <div key={d.menuItem._id}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{d.menuItem.emoji}</span>
                <span className="flex-1 font-semibold text-ink">{d.menuItem.name}</span>
                <span className="text-2xl font-bold text-ink tabular-nums">{d.total}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-line pt-3 flex items-center justify-between">
        <span className="font-bold text-ink">Total drinks</span>
        <span className="text-2xl font-bold text-ink tabular-nums">{ordered.length}</span>
      </div>

      <div className="space-y-1">
        <NameList label={final ? 'No response' : 'Pending'} members={pending} />
      </div>
    </div>
  );
}
