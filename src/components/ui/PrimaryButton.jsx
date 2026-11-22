import { Check, Loader2 } from 'lucide-react';

export function PrimaryButton({ loading = false, disabled, icon: Icon = Check, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`btn-primary ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={20} strokeWidth={1.8} className="animate-spin" aria-hidden="true" />
      ) : (
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
