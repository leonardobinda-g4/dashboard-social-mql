import { fmt, fmtReais } from '../lib/utils';

interface KPIBarProps {
  totalMeta: number;
  totalMql: number;
  atingPct: number | null;
  totalSpend: number;
}

export function KPIBar({ totalMeta, totalMql, atingPct, totalSpend }: KPIBarProps) {
  const atingColor = atingPct == null ? '#94a3b8' : atingPct >= 100 ? '#16a34a' : atingPct >= 80 ? '#E8A838' : '#ef4444';

  return (
    <div className="flex items-center gap-5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-black/40 font-semibold">Meta MQL</span>
        <span className="text-lg font-extrabold tracking-tight" style={{ color: '#000' }}>{fmt(totalMeta)}</span>
      </div>
      <div className="w-px h-5 bg-[rgba(185,145,91,0.3)]" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-black/40 font-semibold">Total MQL</span>
        <span className="text-lg font-extrabold tracking-tight" style={{ color: '#1d4ed8' }}>{fmt(totalMql)}</span>
      </div>
      {atingPct != null && (
        <>
          <div className="w-px h-5 bg-[rgba(185,145,91,0.3)]" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-black/40 font-semibold">Atingimento</span>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: atingColor }}>{atingPct}%</span>
          </div>
        </>
      )}
      <div className="w-px h-5 bg-[rgba(185,145,91,0.3)]" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-black/40 font-semibold">Spend Impuls.</span>
        <span className="text-lg font-extrabold tracking-tight" style={{ color: '#059669' }}>{fmtReais(totalSpend)}</span>
      </div>
    </div>
  );
}
