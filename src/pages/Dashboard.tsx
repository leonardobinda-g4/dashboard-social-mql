import { useState } from 'react';
import { FilterControls } from '../components/FilterControls';
import { KPIBar } from '../components/KPIBar';
import { MqlChart } from '../components/MqlChart';
import { DrilldownPanel } from '../components/DrilldownPanel';
import { useFilters } from '../hooks/useFilters';
import { useDashboardData } from '../hooks/useDashboardData';

export default function Dashboard() {
  const { filters, setPeriodo, setCustomRange, togglePerfil, toggleMqlType, toggleFeedMetric, toggleStoryMetric } = useFilters();
  const { chartData, totalMql, totalMeta, totalSpend, atingPct } = useDashboardData(filters);
  const [drilldownDate, setDrilldownDate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-['Manrope',sans-serif] p-7 px-8">
      {/* Header */}
      <div className="mb-7 border-b border-[rgba(185,145,91,0.25)] pb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-extrabold text-[22px] tracking-tight text-[#B9915B]">Dashboard MQL Social</h1>
          <p className="text-xs text-black/45 mt-1">Funil de Marketing &middot; Área Social &middot; Instagram</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[rgba(185,145,91,0.08)] border border-[rgba(185,145,91,0.3)] rounded-full px-3 py-1.5 text-[11px] text-[#B9915B] font-semibold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 shadow-[0_0_6px_#16a34a]" />
          Live Data
        </div>
      </div>

      {/* Filters */}
      <FilterControls
        filters={filters}
        onPeriodo={setPeriodo}
        onCustomRange={setCustomRange}
        onTogglePerfil={togglePerfil}
        onToggleMqlType={toggleMqlType}
        onToggleFeedMetric={toggleFeedMetric}
        onToggleStoryMetric={toggleStoryMetric}
      />

      {/* Chart Card */}
      <div className="bg-[#FAFAFA] border border-[rgba(185,145,91,0.25)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2.5">
          <span className="text-xs font-bold text-black/45 uppercase tracking-wider">
            MQL vs Engajamento — visão diária
          </span>
          <KPIBar
            totalMeta={totalMeta}
            totalMql={totalMql}
            atingPct={atingPct}
            totalSpend={totalSpend}
          />
        </div>
        <MqlChart
          data={chartData}
          activeFeedMetrics={filters.activeFeedMetrics}
          activeStoryMetrics={filters.activeStoryMetrics}
          activeMqlTypes={filters.activeMqlTypes}
          onClickDate={setDrilldownDate}
        />
      </div>

      {/* Drilldown */}
      {drilldownDate && (
        <DrilldownPanel
          date={drilldownDate}
          selectedPerfis={filters.selectedPerfis}
          onClose={() => setDrilldownDate(null)}
        />
      )}
    </div>
  );
}
