import { useState, useMemo } from 'react';
import { postsRaw, storiesDetailRaw, spendPerPost } from '../data';
import { PERFIL_INSTA, MAIN_PERFIS, PROFILE_LABELS } from '../types/dashboard';
import { fmt, formatDateBR } from '../lib/utils';

interface DrilldownPanelProps {
  date: string;
  selectedPerfis: Set<string>;
  onClose: () => void;
}

function getAllowedUsernames(selectedPerfis: Set<string>): Set<string> | null {
  if (selectedPerfis.has('todos')) return null;
  const mainUsers = Object.values(PERFIL_INSTA);
  const allowed = new Set<string>();
  for (const p of selectedPerfis) {
    if (p === 'outros') {
      (postsRaw as any[]).forEach((r: any) => { if (!mainUsers.includes(r[1])) allowed.add(r[1]); });
    } else {
      const u = PERFIL_INSTA[p]; if (u) allowed.add(u);
    }
  }
  return allowed;
}

export function DrilldownPanel({ date, selectedPerfis, onClose }: DrilldownPanelProps) {
  const [tab, setTab] = useState<'posts' | 'stories'>('posts');

  const allowed = useMemo(() => getAllowedUsernames(selectedPerfis), [selectedPerfis]);
  const matchUser = (u: string) => allowed === null || allowed.has(u);

  const posts = useMemo(() =>
    (postsRaw as any[]).filter((r: any) => r[0] === date && matchUser(r[1]))
  , [date, allowed]);

  const stories = useMemo(() =>
    (storiesDetailRaw as any[]).filter((r: any) => r[0] === date && matchUser(r[1]))
  , [date, allowed]);

  const spLookup = spendPerPost as Record<string, number>;

  return (
    <div className="bg-[#FAFAFA] border border-[rgba(185,145,91,0.25)] rounded-2xl p-6 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
        <div className="flex items-center gap-3 text-sm font-bold text-[#1a1a1a]">
          <span>{formatDateBR(date)}</span>
          <button onClick={onClose} className="text-[22px] text-black/30 hover:text-black leading-none">&times;</button>
        </div>
        <div className="flex gap-1">
          <TabButton active={tab === 'posts'} onClick={() => setTab('posts')} label={`Posts (${posts.length})`} />
          <TabButton active={tab === 'stories'} onClick={() => setTab('stories')} label={`Stories (${stories.length})`} />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3 max-h-[520px] overflow-y-auto">
        {tab === 'posts' ? (
          posts.length === 0 ? (
            <EmptyState text="Nenhum post neste dia" />
          ) : (
            posts.map((r: any, i: number) => <PostCard key={i} row={r} spend={spLookup[r[4]]} />)
          )
        ) : (
          stories.length === 0 ? (
            <EmptyState text="Nenhum story registrado neste dia" />
          ) : (
            stories.map((r: any, i: number) => <StoryCard key={i} row={r} />)
          )
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full border-[1.5px] text-[11px] font-semibold transition-all ${
        active
          ? 'bg-[#B9915B] border-[#B9915B] text-white'
          : 'border-[rgba(185,145,91,0.3)] text-black/45 hover:border-[rgba(185,145,91,0.6)] hover:text-black/70'
      }`}
    >
      {label}
    </button>
  );
}

function PostCard({ row, spend }: { row: any; spend?: number }) {
  return (
    <div className="bg-white border border-[rgba(185,145,91,0.15)] rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-[#B9915B] capitalize">{PROFILE_LABELS[row[1]] || row[1]}</span>
        {spend && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-[10px] bg-emerald-500/10 text-emerald-600 ml-auto">
            R$ {spend >= 1e3 ? (spend / 1e3).toFixed(1) + 'k' : spend.toFixed(0)}
          </span>
        )}
        <span className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[10px] bg-[rgba(185,145,91,0.1)] text-[rgba(185,145,91,0.8)]">
          {row[2]}
        </span>
      </div>
      {row[3] && (
        <p className="text-xs text-black/65 leading-relaxed line-clamp-3">{row[3]}</p>
      )}
      <div className="flex items-center gap-3.5 text-[11px] text-black/45 font-semibold">
        <span title="Alcance">&#128065; {fmt(row[5])}</span>
        <span title="Curtidas">&#10084; {fmt(row[6])}</span>
        <span title="Comentários">&#128172; {fmt(row[7])}</span>
        <span title="Compartilhamentos">&#128257; {fmt(row[8])}</span>
        <span title="Salvamentos">&#128278; {fmt(row[9])}</span>
        <span title="Total Interações">&#9889; {fmt(row[10])}</span>
      </div>
      <a href={row[4]} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-700 hover:underline">
        Ver no Instagram &rarr;
      </a>
    </div>
  );
}

function StoryCard({ row }: { row: any }) {
  return (
    <div className="bg-white border border-[rgba(185,145,91,0.15)] rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-[#B9915B] capitalize">{PROFILE_LABELS[row[1]] || row[1]}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[10px] bg-[rgba(185,145,91,0.1)] text-[rgba(185,145,91,0.8)]">
          STORY
        </span>
      </div>
      {row[2] && (
        <p className="text-xs text-black/65 leading-relaxed line-clamp-3">{row[2]}</p>
      )}
      <div className="flex items-center gap-3.5 text-[11px] text-black/45 font-semibold">
        <span title="Alcance">&#128065; {fmt(row[4])}</span>
        <span title="Visualizações">&#9654; {fmt(row[7])}</span>
        <span title="Respostas">&#128172; {fmt(row[5])}</span>
        <span title="Compartilhamentos">&#128257; {fmt(row[6])}</span>
        <span title="Total Interações">&#9889; {fmt(row[8])}</span>
      </div>
      <a href={row[3]} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-700 hover:underline">
        Ver no Instagram &rarr;
      </a>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-full py-8 text-center text-black/35 text-[13px] font-medium">{text}</div>
  );
}
