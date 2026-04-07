import { useState, useRef, useEffect } from 'react';
import { MetricPill } from './MetricPill';
import { FEED_METRICS, STORY_METRICS, type MqlType } from '../types/dashboard';
import type { FilterState } from '../types/dashboard';

interface FilterControlsProps {
  filters: FilterState;
  onPeriodo: (v: string) => void;
  onCustomRange: (from: string, to: string) => void;
  onTogglePerfil: (p: string) => void;
  onToggleMqlType: (t: MqlType) => void;
  onToggleFeedMetric: (k: string) => void;
  onToggleStoryMetric: (k: string) => void;
}

const PERIODO_OPTIONS = [
  { label: 'Hoje', value: '1' },
  { label: 'Ontem', value: '2' },
  { divider: true },
  { label: 'Últimos 7 dias', value: '7' },
  { label: 'Últimos 14 dias', value: '14' },
  { label: 'Últimos 28 dias', value: '28' },
  { label: 'Últimos 30 dias', value: '30' },
  { label: 'Últimos 90 dias', value: '90' },
  { label: 'Últimos 180 dias', value: '180' },
  { label: 'Últimos 365 dias', value: '365' },
  { label: 'Ano até hoje', value: 'ytd' },
  { divider: true },
  { label: 'Esta semana', value: 'this_week' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Este trimestre', value: 'this_quarter' },
  { label: 'Este ano', value: 'this_year' },
  { divider: true },
  { label: 'Semana anterior', value: 'prev_week' },
  { label: 'Mês anterior', value: 'prev_month' },
  { label: 'Trimestre anterior', value: 'prev_quarter' },
  { label: 'Ano anterior', value: 'prev_year' },
  { divider: true },
  { label: 'Tudo', value: '9999' },
];

const PERFIL_OPTIONS = [
  { label: 'Todos', value: 'todos' },
  null, // divider
  { label: 'Tallis Gomes', value: 'tallis' },
  { label: 'Alfredo Soares', value: 'alfredo' },
  { label: 'G4', value: 'g4' },
  { label: 'Bruno Nardon', value: 'nardon' },
  null,
  { label: 'Outros', value: 'outros' },
];

function Dropdown({ label, options, selected, onSelect, multi = false }: {
  label: string;
  options: (any | null)[];
  selected: string | Set<string>;
  onSelect: (v: string) => void;
  multi?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const displayLabel = typeof selected === 'string'
    ? options.find((o: any) => o?.value === selected)?.label || selected
    : label;

  const isSelected = (v: string) => typeof selected === 'string' ? selected === v : selected.has(v);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 bg-black/[.03] border rounded-[9px] px-3.5 py-1.5 text-xs font-semibold text-black/70 min-w-[150px] whitespace-nowrap transition-all ${open ? 'border-[#B9915B] bg-[rgba(185,145,91,0.06)]' : 'border-[rgba(185,145,91,0.3)] hover:border-[rgba(185,145,91,0.7)]'}`}
      >
        <span>{typeof selected !== 'string' && selected.has('todos') ? label : displayLabel}</span>
        <span className={`ml-auto text-[9px] opacity-40 transition-transform ${open ? 'rotate-180' : ''}`}>&#9660;</span>
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white border border-[rgba(185,145,91,0.4)] rounded-xl p-2 min-w-[210px] shadow-lg max-h-[420px] overflow-y-auto">
          {options.map((opt, i) => {
            if (opt === null || opt?.divider) return <div key={i} className="h-px bg-[rgba(185,145,91,0.12)] my-1 mx-0.5" />;
            const sel = isSelected(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => { onSelect(opt.value); if (!multi) setOpen(false); }}
                className={`flex items-center gap-2 w-full px-2.5 py-[7px] rounded-lg text-xs font-medium transition-all ${sel ? 'text-black font-semibold' : 'text-black/50 hover:bg-[rgba(185,145,91,0.08)] hover:text-black'}`}
              >
                {multi && (
                  <span className={`w-4 h-4 border-[1.5px] rounded flex items-center justify-center shrink-0 text-[10px] font-extrabold ${sel ? 'bg-[#B9915B] border-[#B9915B] text-white' : 'border-[rgba(185,145,91,0.4)] text-transparent'}`}>
                    &#10003;
                  </span>
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterControls({ filters, onPeriodo, onCustomRange, onTogglePerfil, onToggleMqlType, onToggleFeedMetric, onToggleStoryMetric }: FilterControlsProps) {
  const { selectedPerfis, activeMqlTypes, activeFeedMetrics, activeStoryMetrics } = filters;

  const perfilLabel = selectedPerfis.has('todos')
    ? 'Todos os perfis'
    : [...selectedPerfis].slice(0, 2).join(', ') + (selectedPerfis.size > 2 ? ` +${selectedPerfis.size - 2}` : '');

  return (
    <div className="bg-[#FAFAFA] border border-[rgba(185,145,91,0.3)] rounded-[14px] p-4 px-5 mb-4 flex flex-col gap-3.5">
      {/* Linha 1: Período, Perfil, Tipo MQL */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-[rgba(185,145,91,0.8)] font-bold min-w-[44px] whitespace-nowrap">Período</span>
        <Dropdown
          label="Últimos 30 dias"
          options={PERIODO_OPTIONS}
          selected={String(filters.currentRange === -1 ? 'custom' : filters.currentRange)}
          onSelect={onPeriodo}
        />

        <span className="text-[10px] uppercase tracking-widest text-[rgba(185,145,91,0.8)] font-bold min-w-[44px] whitespace-nowrap">Perfil</span>
        <Dropdown
          label={perfilLabel}
          options={PERFIL_OPTIONS}
          selected={selectedPerfis}
          onSelect={onTogglePerfil}
          multi
        />

        <span className="text-[10px] uppercase tracking-widest text-[rgba(185,145,91,0.8)] font-bold min-w-[44px] whitespace-nowrap">Tipo MQL</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['bio', 'stories', 'outros'] as MqlType[]).map(t => (
            <MetricPill
              key={t}
              label={t === 'bio' ? 'Bio' : t === 'stories' ? 'Stories' : 'Outros'}
              color={t === 'bio' ? '#1d4ed8' : t === 'stories' ? '#22d3ee' : '#93c5fd'}
              active={activeMqlTypes.has(t)}
              onClick={() => onToggleMqlType(t)}
            />
          ))}
        </div>
      </div>

      {/* Linha 2: Métricas Feed */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-[rgba(185,145,91,0.8)] font-bold min-w-[44px] whitespace-nowrap">Métricas Feed</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FEED_METRICS.map(m => (
            <MetricPill
              key={m.key}
              label={m.label}
              color={m.color}
              active={activeFeedMetrics.has(m.key)}
              onClick={() => onToggleFeedMetric(m.key)}
            />
          ))}
        </div>
      </div>

      {/* Linha 3: Métricas Stories */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-[rgba(185,145,91,0.8)] font-bold min-w-[44px] whitespace-nowrap">Métricas Stories</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STORY_METRICS.map(m => (
            <MetricPill
              key={m.key}
              label={m.label}
              color={m.color}
              active={activeStoryMetrics.has(m.key)}
              onClick={() => onToggleStoryMetric(m.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
