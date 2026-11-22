export function TabBar({ tabs, active, onChange }) {
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 inset-x-0 z-40 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div
        role="tablist"
        className="pointer-events-auto mx-auto max-w-[440px] flex gap-1 p-1 bg-surface border border-line"
        style={{ borderRadius: 'var(--radius-3)', boxShadow: 'var(--shadow-md)' }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={`flex-1 min-h-[52px] flex flex-col items-center justify-center gap-0.5 text-xs font-bold
                          transition-colors duration-150 ${
                isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'
              }`}
              style={{ borderRadius: 'var(--radius-2)' }}
            >
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" className={isActive ? 'text-accent' : ''} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
