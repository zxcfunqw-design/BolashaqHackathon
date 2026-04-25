type ProgressBarProps = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between text-sm font-semibold text-qadam-graphite">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full rounded-full bg-qadam-primary" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
