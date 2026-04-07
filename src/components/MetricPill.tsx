interface MetricPillProps {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

export function MetricPill({ label, color, active, onClick }: MetricPillProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[1.5px] text-[11px] font-semibold transition-all select-none whitespace-nowrap"
      style={{
        borderColor: active ? color : 'rgba(185,145,91,0.3)',
        backgroundColor: active ? color : 'transparent',
        color: active ? '#fff' : 'rgba(26,26,26,0.45)',
      }}
    >
      <span
        className="w-[7px] h-[7px] rounded-full shrink-0"
        style={{ backgroundColor: active ? '#fff' : color }}
      />
      {label}
    </button>
  );
}
