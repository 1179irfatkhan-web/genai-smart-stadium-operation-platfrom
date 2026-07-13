interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div
        className={`${sizeClass} border-2 border-current border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      {text && <p className="text-sm text-secondary">{text}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
