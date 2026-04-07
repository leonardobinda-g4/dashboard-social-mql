import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FEED_METRICS, STORY_METRICS } from '../types/dashboard';
import type { ChartDataPoint } from '../hooks/useDashboardData';
import { fmt, fmtReais, formatDateBR } from '../lib/utils';

interface MqlChartProps {
  data: ChartDataPoint[];
  activeFeedMetrics: Set<string>;
  activeStoryMetrics: Set<string>;
  activeMqlTypes: Set<string>;
  onClickDate: (date: string) => void;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const d = label as string;
  const dateLabel = formatDateBR(d, true);

  const metaItem = payload.find((p: any) => p.dataKey === 'meta');
  const bioItem = payload.find((p: any) => p.dataKey === 'bio');
  const storiesItem = payload.find((p: any) => p.dataKey === 'stories');
  const outrosItem = payload.find((p: any) => p.dataKey === 'outros');

  const bioV = bioItem?.value ?? 0;
  const storiesV = storiesItem?.value ?? 0;
  const outrosV = outrosItem?.value ?? 0;
  const totMql = bioV + storiesV + outrosV;

  const metricItems = payload.filter((p: any) =>
    !['meta', 'bio', 'stories', 'outros'].includes(p.dataKey) && p.value != null && p.value !== 0
  );

  return (
    <div className="bg-white border border-black/10 rounded-xl px-3.5 py-2.5 shadow-lg text-xs text-[#1a1a1a] max-w-[280px]">
      <div className="font-bold text-[13px] mb-1.5 text-gray-700">{dateLabel}</div>

      {metaItem?.value != null && (
        <Row color="#000" label="Meta MQL" value={fmt(metaItem.value)} dashed />
      )}
      {totMql > 0 && (
        <>
          <Row color="#1d4ed8" label="Total MQL" value={fmt(totMql)} />
          {bioV > 0 && <Row color="#1d4ed8" label="  Bio" value={fmt(bioV)} indent />}
          {storiesV > 0 && <Row color="#22d3ee" label="  Stories" value={fmt(storiesV)} indent />}
          {outrosV > 0 && <Row color="#93c5fd" label="  Outros" value={fmt(outrosV)} indent />}
        </>
      )}

      {metricItems.length > 0 && (
        <>
          <div className="border-t border-black/5 my-1" />
          {metricItems.map((item: any) => {
            const isSpend = item.dataKey.includes('spend');
            return (
              <Row
                key={item.dataKey}
                color={item.color}
                label={item.name}
                value={isSpend ? fmtReais(item.value) : fmt(item.value)}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

function Row({ color, label, value, dashed, indent }: { color: string; label: string; value: string; dashed?: boolean; indent?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-0.5 ${indent ? 'pl-4' : ''}`}>
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{
          backgroundColor: dashed ? 'transparent' : color,
          border: dashed ? `2px dashed ${color}` : 'none',
        }}
      />
      <span className="flex-1 text-gray-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export function MqlChart({ data, activeFeedMetrics, activeStoryMetrics, activeMqlTypes, onClickDate }: MqlChartProps) {
  const hasRightAxis = activeFeedMetrics.size > 0 || activeStoryMetrics.size > 0;

  const handleClick = (state: any) => {
    if (state?.activeLabel) onClickDate(state.activeLabel);
  };

  const feedMetricLines = FEED_METRICS.filter(m => activeFeedMetrics.has(m.key)).map(m => ({
    dataKey: m.key === 'spend' ? 'feed_spend' : `feed_${m.key}`,
    name: m.key === 'spend' ? m.label : `${m.label} (Feed)`,
    color: m.color,
  }));

  const storyMetricLines = STORY_METRICS.filter(m => activeStoryMetrics.has(m.key)).map(m => ({
    dataKey: m.key === 'st_count' ? 'story_count' : `story_${m.key.replace('st_', '')}`,
    name: `${m.label} (Stories)`,
    color: m.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={460}>
      <ComposedChart data={data} onClick={handleClick}>
        <CartesianGrid strokeDasharray="" stroke="rgba(0,0,0,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#d1d5db' }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ value: 'MQL / dia', angle: -90, position: 'insideLeft', style: { fill: '#374151', fontSize: 11, fontWeight: 600 } }}
        />
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(v: number) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'k' : String(v)}
            label={{ value: 'Engajamento', angle: 90, position: 'insideRight', style: { fill: '#374151', fontSize: 11, fontWeight: 600 } }}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
          iconType="plainline"
        />

        {/* Meta line */}
        <Line
          yAxisId="left"
          type="linear"
          dataKey="meta"
          name="Meta MQL"
          stroke="#000"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          connectNulls
        />

        {/* MQL stacked bars */}
        {activeMqlTypes.has('bio') && (
          <Bar yAxisId="left" dataKey="bio" name="Bio" stackId="mql" fill="#1d4ed8" radius={[0, 0, 3, 3]} />
        )}
        {activeMqlTypes.has('stories') && (
          <Bar yAxisId="left" dataKey="stories" name="Stories" stackId="mql" fill="#22d3ee" radius={0} />
        )}
        {activeMqlTypes.has('outros') && (
          <Bar yAxisId="left" dataKey="outros" name="Outros" stackId="mql" fill="#93c5fd" radius={[3, 3, 0, 0]} />
        )}

        {/* Feed metric lines */}
        {feedMetricLines.map(m => (
          <Line
            key={m.dataKey}
            yAxisId={hasRightAxis ? 'right' : 'left'}
            type="monotone"
            dataKey={m.dataKey}
            name={m.name}
            stroke={m.color}
            strokeWidth={1.8}
            dot={false}
            connectNulls
          />
        ))}

        {/* Story metric lines */}
        {storyMetricLines.map(m => (
          <Line
            key={m.dataKey}
            yAxisId={hasRightAxis ? 'right' : 'left'}
            type="monotone"
            dataKey={m.dataKey}
            name={m.name}
            stroke={m.color}
            strokeWidth={1.8}
            dot={false}
            connectNulls
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
