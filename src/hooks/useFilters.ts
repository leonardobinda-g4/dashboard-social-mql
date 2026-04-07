import { useState, useCallback } from 'react';
import type { FilterState, MqlType } from '../types/dashboard';
import { isoDate } from '../lib/utils';

const initialState: FilterState = {
  currentRange: 30,
  customFrom: null,
  customTo: null,
  selectedPerfis: new Set(['todos']),
  activeMqlTypes: new Set<MqlType>(['bio', 'stories', 'outros']),
  activeFeedMetrics: new Set<string>(),
  activeStoryMetrics: new Set<string>(),
};

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const setPeriodo = useCallback((value: string) => {
    setFilters(prev => {
      const today = new Date();
      let customFrom: string | null = null;
      let customTo: string | null = null;
      let currentRange = 30;

      if (value === 'ytd') {
        customFrom = today.getFullYear() + '-01-01'; customTo = isoDate(today); currentRange = -1;
      } else if (value === 'this_week') {
        const day = today.getDay(); const diff = day === 0 ? 6 : day - 1;
        const mon = new Date(today); mon.setDate(mon.getDate() - diff);
        customFrom = isoDate(mon); customTo = isoDate(today); currentRange = -1;
      } else if (value === 'this_month') {
        customFrom = isoDate(today).slice(0, 8) + '01'; customTo = isoDate(today); currentRange = -1;
      } else if (value === 'this_quarter') {
        const q = Math.floor(today.getMonth() / 3);
        customFrom = today.getFullYear() + '-' + String(q * 3 + 1).padStart(2, '0') + '-01';
        customTo = isoDate(today); currentRange = -1;
      } else if (value === 'this_year') {
        customFrom = today.getFullYear() + '-01-01'; customTo = isoDate(today); currentRange = -1;
      } else if (value === 'prev_week') {
        const day = today.getDay(); const diff = day === 0 ? 6 : day - 1;
        const mon = new Date(today); mon.setDate(mon.getDate() - diff - 7);
        const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
        customFrom = isoDate(mon); customTo = isoDate(sun); currentRange = -1;
      } else if (value === 'prev_month') {
        const pm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const pmEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        customFrom = isoDate(pm); customTo = isoDate(pmEnd); currentRange = -1;
      } else if (value === 'prev_quarter') {
        const q = Math.floor(today.getMonth() / 3);
        const pq = q === 0 ? 3 : q - 1;
        const yr = q === 0 ? today.getFullYear() - 1 : today.getFullYear();
        customFrom = isoDate(new Date(yr, pq * 3, 1)); customTo = isoDate(new Date(yr, pq * 3 + 3, 0)); currentRange = -1;
      } else if (value === 'prev_year') {
        const py = today.getFullYear() - 1;
        customFrom = py + '-01-01'; customTo = py + '-12-31'; currentRange = -1;
      } else if (value === '2') {
        const y = new Date(today); y.setDate(y.getDate() - 1);
        customFrom = isoDate(y); customTo = isoDate(y); currentRange = -1;
      } else {
        currentRange = parseInt(value);
      }

      return { ...prev, currentRange, customFrom, customTo };
    });
  }, []);

  const setCustomRange = useCallback((from: string, to: string) => {
    setFilters(prev => ({ ...prev, currentRange: -1, customFrom: from, customTo: to }));
  }, []);

  const togglePerfil = useCallback((p: string) => {
    setFilters(prev => {
      const next = new Set(prev.selectedPerfis);
      if (p === 'todos') return { ...prev, selectedPerfis: new Set(['todos']) };
      next.delete('todos');
      if (next.has(p)) next.delete(p); else next.add(p);
      if (next.size === 0) next.add('todos');
      return { ...prev, selectedPerfis: next };
    });
  }, []);

  const toggleMqlType = useCallback((t: MqlType) => {
    setFilters(prev => {
      const next = new Set(prev.activeMqlTypes);
      if (next.has(t)) next.delete(t); else next.add(t);
      if (next.size === 0) return { ...prev, activeMqlTypes: new Set<MqlType>(['bio', 'stories', 'outros']) };
      return { ...prev, activeMqlTypes: next };
    });
  }, []);

  const toggleFeedMetric = useCallback((key: string) => {
    setFilters(prev => {
      const next = new Set(prev.activeFeedMetrics);
      if (next.has(key)) next.delete(key); else next.add(key);
      return { ...prev, activeFeedMetrics: next };
    });
  }, []);

  const toggleStoryMetric = useCallback((key: string) => {
    setFilters(prev => {
      const next = new Set(prev.activeStoryMetrics);
      if (next.has(key)) next.delete(key); else next.add(key);
      return { ...prev, activeStoryMetrics: next };
    });
  }, []);

  return {
    filters,
    setPeriodo,
    setCustomRange,
    togglePerfil,
    toggleMqlType,
    toggleFeedMetric,
    toggleStoryMetric,
  };
}
