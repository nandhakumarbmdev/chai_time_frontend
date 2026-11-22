import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  quiet: 'btn-quiet',
};

export function Button({
  variant = 'secondary',
  icon: Icon,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={20} strokeWidth={1.8} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
