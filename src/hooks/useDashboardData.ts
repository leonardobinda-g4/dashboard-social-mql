import { useMemo } from 'react';
import {
  mqlRaw, mqlPerfilRaw, mqlPerfilContentRaw,
  metaMqlPerfil, instaRaw, instaPerfilRaw,
  storyMetricsRaw, storyMetricsPerfilRaw, storiesRaw,
  spendRaw, spendPerfilRaw,
} from '../data';
import {
  PERFIL_INSTA, MAIN_PERFIS, PERFIL_META_LINHA, META_SPLIT,
  type FilterState, type MqlType,
} from '../types/dashboard';
import { isoDate } from '../lib/utils';

function getMqlMap(selectedPerfis: Set<string>) {
  if (selectedPerfis.has('todos')) {
    return Object.fromEntries((mqlRaw as any[]).map((r: any) => [r[0], Number(r[1])]));
  }
  const merged: Record<string, number> = {};
  for (const p of selectedPerfis) {
    const rows = p === 'outros'
      ? (mqlPerfilRaw as any[]).filter((r: any) => !MAIN_PERFIS.includes(r[1]))
      : (mqlPerfilRaw as any[]).filter((r: any) => r[1] === p);
    rows.forEach((r: any) => { merged[r[0]] = (merged[r[0]] || 0) + Number(r[2]); });
  }
  return merged;
}

function getInstaMap(selectedPerfis: Set<string>) {
  if (selectedPerfis.has('todos')) {
    return Object.fromEntries((instaRaw as any[]).map((r: any) => [r[0], r]));
  }
  const merged: Record<string, any[]> = {};
  for (const p of selectedPerfis) {
    const u = PERFIL_INSTA[p]; if (!u) continue;
    (instaPerfilRaw as any[]).filter((r: any) => r[1] === u).forEach((r: any) => {
      const row = [r[0], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]];
      if (!merged[r[0]]) merged[r[0]] = [...row];
      else { for (let i = 1; i < row.length; i++) { if (row[i] != null) merged[r[0]][i] = (Number(merged[r[0]][i] || 0)) + Number(row[i]); } }
    });
  }
  return merged;
}

function getMetaMap(selectedPerfis: Set<string>, activeMqlTypes: Set<MqlType>) {
  const hasBio = activeMqlTypes.has('bio');
  const hasSt = activeMqlTypes.has('stories');
  if (!hasBio && !hasSt) return {};

  const getFactor = (perfil: string) => {
    if (hasBio && hasSt) return 1;
    const s = META_SPLIT[perfil] || META_SPLIT.outros;
    let f = 0;
    if (hasBio) f += s.bio;
    if (hasSt) f += s.stories;
    return f;
  };

  if (selectedPerfis.has('todos')) {
    if (hasBio && hasSt) {
      const m: Record<string, number> = {};
      (metaMqlPerfil as any[]).forEach((r: any) => { m[r[0]] = (m[r[0]] || 0) + r[2]; });
      return m;
    }
    const perfilFromLinha: Record<string, string> = {};
    for (const [p, linhas] of Object.entries(PERFIL_META_LINHA)) {
      for (const l of linhas) perfilFromLinha[l] = p;
    }
    const m: Record<string, number> = {};
    (metaMqlPerfil as any[]).forEach((r: any) => {
      const p = perfilFromLinha[r[1]] || 'outros';
      m[r[0]] = (m[r[0]] || 0) + r[2] * getFactor(p);
    });
    for (const d in m) m[d] = Math.round(m[d]);
    return m;
  }

  const m: Record<string, number> = {};
  for (const p of selectedPerfis) {
    const linhas = PERFIL_META_LINHA[p];
    if (!linhas) continue;
    const f = getFactor(p);
    (metaMqlPerfil as any[]).filter((r: any) => linhas.includes(r[1])).forEach((r: any) => {
      m[r[0]] = (m[r[0]] || 0) + r[2] * f;
    });
  }
  for (const d in m) m[d] = Math.round(m[d]);
  return m;
}

function getMqlContentMap(selectedPerfis: Set<string>, mqlMap: Record<string, number>) {
  const useTodos = selectedPerfis.has('todos');
  const raw: Record<string, Record<string, number>> = {};
  (mqlPerfilContentRaw as any[]).forEach((r: any) => {
    const med = r[1];
    if (!useTodos) {
      let match = false;
      for (const p of selectedPerfis) {
        if (p === 'outros') { if (!MAIN_PERFIS.includes(med)) { match = true; break; } }
        else { if (med === p) { match = true; break; } }
      }
      if (!match) return;
    }
    if (!raw[r[0]]) raw[r[0]] = { bio: 0, stories: 0, outros: 0 };
    raw[r[0]][r[2]] = (raw[r[0]][r[2]] || 0) + Number(r[3]);
  });
  const m: Record<string, { bio: number; stories: number; outros: number }> = {};
  for (const [d, v] of Object.entries(raw)) {
    const total = v.bio + v.stories + v.outros;
    const mqlReal = mqlMap[d] || 0;
    if (total === 0 || mqlReal === 0) {
      m[d] = { bio: 0, stories: 0, outros: 0 };
    } else {
      const bio = Math.round(mqlReal * (v.bio / total));
      const stories = Math.round(mqlReal * (v.stories / total));
      m[d] = { bio, stories, outros: Math.max(0, mqlReal - bio - stories) };
    }
  }
  return m;
}

function getSpendMap(selectedPerfis: Set<string>) {
  if (selectedPerfis.has('todos')) {
    return Object.fromEntries((spendRaw as any[]).map((r: any) => [r[0], r[1]]));
  }
  const m: Record<string, number> = {};
  const mainUsers = Object.values(PERFIL_INSTA);
  for (const p of selectedPerfis) {
    if (p === 'outros') {
      (spendPerfilRaw as any[]).filter((r: any) => !mainUsers.includes(r[1])).forEach((r: any) => { m[r[0]] = (m[r[0]] || 0) + r[2]; });
    } else {
      const u = PERFIL_INSTA[p]; if (!u) continue;
      (spendPerfilRaw as any[]).filter((r: any) => r[1] === u).forEach((r: any) => { m[r[0]] = (m[r[0]] || 0) + r[2]; });
    }
  }
  return m;
}

function getStoryMetricsMap(selectedPerfis: Set<string>) {
  if (selectedPerfis.has('todos')) {
    return Object.fromEntries((storyMetricsRaw as any[]).map((r: any) => [r[0], r]));
  }
  const mainUsers = Object.values(PERFIL_INSTA);
  const merged: Record<string, number[]> = {};
  const addRow = (r: any) => {
    if (!merged[r[0]]) merged[r[0]] = [0, 0, 0, 0, 0];
    merged[r[0]][0] += r[2]; merged[r[0]][1] += r[3]; merged[r[0]][2] += r[4]; merged[r[0]][3] += r[5]; merged[r[0]][4] += r[6];
  };
  for (const p of selectedPerfis) {
    if (p === 'outros') {
      (storyMetricsPerfilRaw as any[]).filter((r: any) => !mainUsers.includes(r[1])).forEach(addRow);
    } else {
      const u = PERFIL_INSTA[p]; if (!u) continue;
      (storyMetricsPerfilRaw as any[]).filter((r: any) => r[1] === u).forEach(addRow);
    }
  }
  // Convert to same format as storyMetricsRaw: [date, reach, replies, shares, interactions, views]
  return Object.fromEntries(Object.entries(merged).map(([d, vals]) => [d, [d, ...vals]]));
}

function getStoryCountMap(selectedPerfis: Set<string>) {
  const m: Record<string, number> = {};
  if (selectedPerfis.has('todos')) {
    (storiesRaw as any[]).forEach((r: any) => { m[r[0]] = (m[r[0]] || 0) + r[2]; });
  } else {
    const mainUsers = Object.values(PERFIL_INSTA);
    for (const p of selectedPerfis) {
      if (p === 'outros') {
        (storiesRaw as any[]).filter((r: any) => !mainUsers.includes(r[1])).forEach((r: any) => { m[r[0]] = (m[r[0]] || 0) + r[2]; });
      } else {
        const u = PERFIL_INSTA[p]; if (!u) continue;
        (storiesRaw as any[]).filter((r: any) => r[1] === u).forEach((r: any) => { m[r[0]] = (m[r[0]] || 0) + r[2]; });
      }
    }
  }
  return m;
}

function getAllDates(selectedPerfis: Set<string>) {
  if (selectedPerfis.has('todos')) {
    const s = new Set([...(mqlRaw as any[]).map((r: any) => r[0]), ...(instaRaw as any[]).map((r: any) => r[0])]);
    return [...s].sort();
  }
  const s = new Set<string>();
  for (const p of selectedPerfis) {
    const rows = p === 'outros'
      ? (mqlPerfilRaw as any[]).filter((r: any) => !MAIN_PERFIS.includes(r[1]))
      : (mqlPerfilRaw as any[]).filter((r: any) => r[1] === p);
    rows.forEach((r: any) => s.add(r[0]));
    const u = PERFIL_INSTA[p];
    if (u) (instaPerfilRaw as any[]).filter((r: any) => r[1] === u).forEach((r: any) => s.add(r[0]));
  }
  return [...s].sort();
}

function filterDates(dates: string[], currentRange: number, customFrom: string | null, customTo: string | null): string[] {
  if (customFrom && customTo) {
    return dates.filter(d => d >= customFrom && d <= customTo);
  }
  if (currentRange >= 9999) return dates;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - currentRange);
  const cutoffStr = isoDate(cutoff);
  return dates.filter(d => d >= cutoffStr);
}

export interface ChartDataPoint {
  date: string;
  meta: number | null;
  bio: number | null;
  stories: number | null;
  outros: number | null;
  [key: string]: any;
}

export function useDashboardData(filters: FilterState) {
  const { selectedPerfis, activeMqlTypes, currentRange, customFrom, customTo, activeFeedMetrics, activeStoryMetrics } = filters;

  return useMemo(() => {
    const mqlMap = getMqlMap(selectedPerfis);
    const instaMap = getInstaMap(selectedPerfis);
    const metaMap = getMetaMap(selectedPerfis, activeMqlTypes);
    const contentMap = getMqlContentMap(selectedPerfis, mqlMap);
    const spendMap = getSpendMap(selectedPerfis);
    const storyMMap = getStoryMetricsMap(selectedPerfis);
    const storyCountMap = getStoryCountMap(selectedPerfis);

    const allDates = getAllDates(selectedPerfis);
    const dates = filterDates(allDates, currentRange, customFrom, customTo);

    // Build chart data points
    const chartData: ChartDataPoint[] = dates.map(d => {
      const point: ChartDataPoint = {
        date: d,
        meta: metaMap[d] ?? null,
        bio: activeMqlTypes.has('bio') ? (contentMap[d]?.bio ?? null) : null,
        stories: activeMqlTypes.has('stories') ? (contentMap[d]?.stories ?? null) : null,
        outros: activeMqlTypes.has('outros') ? (contentMap[d]?.outros ?? null) : null,
      };

      // Feed metrics
      const ir = instaMap[d];
      if (activeFeedMetrics.has('reach')) point['feed_reach'] = ir ? Number(ir[2]) : null;
      if (activeFeedMetrics.has('likes')) point['feed_likes'] = ir ? Number(ir[3]) : null;
      if (activeFeedMetrics.has('comments')) point['feed_comments'] = ir ? Number(ir[4]) : null;
      if (activeFeedMetrics.has('shares')) point['feed_shares'] = ir ? Number(ir[5]) : null;
      if (activeFeedMetrics.has('saves')) point['feed_saves'] = ir ? Number(ir[6]) : null;
      if (activeFeedMetrics.has('total_interactions')) point['feed_total_interactions'] = ir ? Number(ir[8]) : null;
      if (activeFeedMetrics.has('bio_link_clicked')) point['feed_bio_link_clicked'] = ir ? Number(ir[7]) : null;
      if (activeFeedMetrics.has('spend')) point['feed_spend'] = spendMap[d] ? Math.round(spendMap[d]) : null;

      // Story metrics
      const sr = storyMMap[d] as any;
      if (activeStoryMetrics.has('st_count')) point['story_count'] = storyCountMap[d] ?? null;
      if (activeStoryMetrics.has('st_reach')) point['story_reach'] = sr ? Number(sr[1]) : null;
      if (activeStoryMetrics.has('st_replies')) point['story_replies'] = sr ? Number(sr[2]) : null;
      if (activeStoryMetrics.has('st_shares')) point['story_shares'] = sr ? Number(sr[3]) : null;
      if (activeStoryMetrics.has('st_interactions')) point['story_interactions'] = sr ? Number(sr[4]) : null;
      if (activeStoryMetrics.has('st_views')) point['story_views'] = sr ? Number(sr[5]) : null;

      return point;
    });

    // KPIs
    const totalMql = dates.reduce((s, d) => s + (mqlMap[d] || 0), 0);
    const totalMeta = dates.reduce((s, d) => s + (metaMap[d] || 0), 0);
    const totalSpend = dates.reduce((s, d) => s + (spendMap[d] || 0), 0);
    const atingPct = totalMeta > 0 ? Math.round(totalMql / totalMeta * 100) : null;

    return { chartData, dates, totalMql, totalMeta, totalSpend, atingPct };
  }, [selectedPerfis, activeMqlTypes, currentRange, customFrom, customTo, activeFeedMetrics, activeStoryMetrics]);
}
