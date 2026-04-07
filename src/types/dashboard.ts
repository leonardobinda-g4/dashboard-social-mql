// ── Raw data row types (matching JSON arrays) ──

/** [date, mql_count] */
export type MqlRow = [string, number];

/** [date, perfil, mql_count] */
export type MqlPerfilRow = [string, string, number];

/** [date, perfil, tipo, count] — tipo: 'bio'|'stories'|'outros' */
export type MqlPerfilContentRow = [string, string, string, number];

/** [date, meta_value] or [date, linha, meta_value] */
export type MetaRow = [string, number] | [string, string, number];
export type MetaPerfilRow = [string, string, number];

/** [date, reach, likes, comments, shares, saves, total_interactions, bio_link_clicked, post_count] */
export type InstaRow = [string, ...number[]];

/** [date, username, reach, likes, comments, shares, saves, total_interactions, bio_link_clicked, post_count] */
export type InstaPerfilRow = [string, string, ...number[]];

/** [date, username, type, caption, permalink, reach, likes, comments, shares, saves, total_interactions] */
export type PostRow = [string, string, string, string, string, number, number, number, number, number, number];

/** [date, username, story_count] */
export type StoriesRow = [string, string, number];

/** [date, reach, replies, shares, total_interactions, views] */
export type StoryMetricsRow = [string, number, number, number, number, number];

/** [date, username, reach, replies, shares, total_interactions, views] */
export type StoryMetricsPerfilRow = [string, string, number, number, number, number, number];

/** [date, username, caption, permalink, reach, replies, shares, views, total_interactions] */
export type StoryDetailRow = [string, string, string, string, number, number, number, number, number];

/** [date, total_spend, posts_boosted] */
export type SpendRow = [string, number, number];

/** [date, perfil, total_spend, posts_boosted] */
export type SpendPerfilRow = [string, string, number, number];

/** permalink -> total_spend */
export type SpendPerPost = Record<string, number>;

// ── Filter state ──

export type MqlType = 'bio' | 'stories' | 'outros';

export interface FilterState {
  currentRange: number;
  customFrom: string | null;
  customTo: string | null;
  selectedPerfis: Set<string>;
  activeMqlTypes: Set<MqlType>;
  activeFeedMetrics: Set<string>;
  activeStoryMetrics: Set<string>;
}

// ── Metric definitions ──

export interface MetricDef {
  key: string;
  label: string;
  color: string;
  idx: number | null;
}

// ── Profile mapping ──

export const PERFIL_INSTA: Record<string, string> = {
  tallis: 'tallisgomes',
  alfredo: 'alfredosoares',
  g4: 'g4educacao',
  nardon: 'bruno.nardon',
};

export const MAIN_PERFIS = ['tallis', 'alfredo', 'g4', 'nardon'];

export const PROFILE_LABELS: Record<string, string> = {
  tallisgomes: 'Tallis Gomes',
  g4educacao: 'G4',
  alfredosoares: 'Alfredo Soares',
  'bruno.nardon': 'Bruno Nardon',
  g4club_: 'G4 Club',
  g4podcasts: 'G4 Podcasts',
  g4skills: 'G4 Skills',
  g4sprints: 'G4 Sprints',
  g4scale: 'G4 Scale',
  outros: 'Outros',
};

export const PERFIL_META_LINHA: Record<string, string[]> = {
  tallis: ['Form G4 Instagram Tallis'],
  alfredo: ['Form G4 Instagram Alfredo'],
  g4: ['Form G4 Instagram G4'],
  nardon: ['Form G4 Instagram Nardon'],
  outros: [
    'Form G4 Instagram Outros',
    'Form G4 Incompleto Instagram',
    'Form G4 - K Instagram',
    'Social - (Testes)',
    'Social DM - Perfil K',
    '[CM] Form G4 - Instagram',
    '[IM] Social DM',
    '[SKL] Social',
  ],
};

export const META_SPLIT: Record<string, { bio: number; stories: number }> = {
  tallis: { bio: 0.55, stories: 0.45 },
  alfredo: { bio: 0.55, stories: 0.45 },
  g4: { bio: 0.80, stories: 0.20 },
  nardon: { bio: 0.60, stories: 0.40 },
  outros: { bio: 0.56, stories: 0.38 },
};

// ── Metric definitions ──

export const FEED_METRICS: MetricDef[] = [
  { key: 'reach', label: 'Alcance', color: '#b91c8c', idx: 2 },
  { key: 'likes', label: 'Curtidas', color: '#16a34a', idx: 3 },
  { key: 'comments', label: 'Comentários', color: '#eab308', idx: 4 },
  { key: 'shares', label: 'Compartilhamentos', color: '#f43f5e', idx: 5 },
  { key: 'saves', label: 'Salvamentos', color: '#d97706', idx: 6 },
  { key: 'total_interactions', label: 'Total de Interações', color: '#dc2626', idx: 8 },
  { key: 'bio_link_clicked', label: 'Cliques Bio', color: '#e85d04', idx: 7 },
  { key: 'spend', label: 'Impulsionado (R$)', color: '#059669', idx: null },
];

export const STORY_METRICS: MetricDef[] = [
  { key: 'st_count', label: 'Qtd Stories', color: '#15803d' , idx: null },
  { key: 'st_reach', label: 'Alcance', color: '#65a30d', idx: 1 },
  { key: 'st_replies', label: 'Respostas', color: '#ca8a04', idx: 2 },
  { key: 'st_shares', label: 'Compartilhamentos', color: '#ea580c', idx: 3 },
  { key: 'st_interactions', label: 'Total Interações', color: '#c2410c', idx: 4 },
  { key: 'st_views', label: 'Visualizações', color: '#a16207', idx: 5 },
];
