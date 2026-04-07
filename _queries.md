# Queries de Extração — Dashboard MQL Social

> Referência para atualização recorrente dos dados do dashboard.
> Genie Space ID: `01f12232b2be19c58ed16da7d88b0a69`
> Última atualização completa: 2026-04-06

---

## Mapeamento de owner_id → username

Usado em todas as queries de Instagram (medias/stories):

```sql
CASE
  WHEN owner_id = '17841401582417980' THEN 'talliscgomes'
  WHEN owner_id = '17841449785498428' THEN 'alfredosoares'
  WHEN owner_id = '17841406803098285' THEN 'g4educacao'
  WHEN owner_id = '17841415113498958' THEN 'brunonardon'
  ELSE CAST(owner_id AS STRING)
END AS username
```

> **Nota:** `g4educacao` e `g4.business` são a mesma conta (rebranding). No dashboard, exibimos como "G4".

---

## 1. Posts com métricas (Feed + Reels) → `_postsRaw.json`

**Formato:** `[date, username, tipo, caption, permalink, reach, likes, comments, shares, saves, total_interactions]`
**Tabelas:** `instagram_medias` JOIN `instagram_medias_insights`
**Batching:** ~5000 rows por query, dividir por range de datas

```sql
SELECT
  DATE(m.timestamp) AS dt,
  CASE
    WHEN m.owner_id = '17841401582417980' THEN 'talliscgomes'
    WHEN m.owner_id = '17841449785498428' THEN 'alfredosoares'
    WHEN m.owner_id = '17841406803098285' THEN 'g4educacao'
    WHEN m.owner_id = '17841415113498958' THEN 'brunonardon'
    ELSE CAST(m.owner_id AS STRING)
  END AS username,
  m.media_product_type AS tipo,
  m.caption,
  m.permalink,
  MAX(CASE WHEN i.metric_name = 'reach' THEN CAST(i.value AS BIGINT) END) AS reach,
  MAX(CASE WHEN i.metric_name = 'likes' THEN CAST(i.value AS BIGINT) END) AS likes,
  MAX(CASE WHEN i.metric_name = 'comments' THEN CAST(i.value AS BIGINT) END) AS comments,
  MAX(CASE WHEN i.metric_name = 'shares' THEN CAST(i.value AS BIGINT) END) AS shares,
  MAX(CASE WHEN i.metric_name = 'saved' THEN CAST(i.value AS BIGINT) END) AS saves,
  MAX(CASE WHEN i.metric_name = 'total_interactions' THEN CAST(i.value AS BIGINT) END) AS total_interactions
FROM instagram_medias m
LEFT JOIN instagram_medias_insights i
  ON m.id = i.media_id AND i.period = 'lifetime'
WHERE m.media_product_type IN ('FEED', 'REELS')
  AND DATE(m.timestamp) >= '2025-01-01'
  AND DATE(m.timestamp) < '2026-02-15'
GROUP BY 1, 2, 3, 4, 5
ORDER BY 1, 2
```

> Repetir com ranges subsequentes (`>= '2026-02-15' AND < '2026-04-07'`) para cobrir tudo.
> Deduplicar por permalink mantendo row com maior reach.

---

## 2. Stories individuais com métricas → `_storiesDetailRaw.json`

**Formato:** `[date, username, caption, permalink, reach, replies, shares, views, total_interactions]`
**Tabelas:** `instagram_medias` JOIN `instagram_medias_insights`
**Batching:** ~45 dias por query (Genie trunca em 5000 rows)

```sql
SELECT
  DATE(m.timestamp) AS dt,
  CASE
    WHEN m.owner_id = '17841401582417980' THEN 'talliscgomes'
    WHEN m.owner_id = '17841449785498428' THEN 'alfredosoares'
    WHEN m.owner_id = '17841406803098285' THEN 'g4educacao'
    WHEN m.owner_id = '17841415113498958' THEN 'brunonardon'
    ELSE CAST(m.owner_id AS STRING)
  END AS username,
  m.permalink,
  m.caption,
  m.timestamp,
  MAX(CASE WHEN i.metric_name = 'reach' THEN CAST(i.value AS BIGINT) END) AS reach,
  MAX(CASE WHEN i.metric_name = 'replies' THEN CAST(i.value AS BIGINT) END) AS replies,
  MAX(CASE WHEN i.metric_name = 'shares' THEN CAST(i.value AS BIGINT) END) AS shares,
  MAX(CASE WHEN i.metric_name = 'ig_story_video_views' THEN CAST(i.value AS BIGINT) END) AS views,
  MAX(CASE WHEN i.metric_name = 'total_interactions' THEN CAST(i.value AS BIGINT) END) AS total_interactions
FROM instagram_medias m
LEFT JOIN instagram_medias_insights i
  ON m.id = i.media_id AND i.period = 'lifetime'
WHERE m.media_product_type = 'STORY'
  AND DATE(m.timestamp) >= '2025-01-01'
  AND DATE(m.timestamp) < '2025-02-15'
GROUP BY 1, 2, 3, 4, 5
ORDER BY 1, 5
```

> Repetir em batches de ~45 dias.
> Deduplicar por permalink mantendo row com maior reach.
> Output reordena para: [date, username, caption, permalink, reach, replies, shares, views, total_interactions]

---

## 3. Instagram Feed métricas diárias por perfil → `_instaPerfilRaw.json`

**Formato:** `[date, username, 0, reach, likes, comments, shares, saves, 0, total_interactions]`
**Tabelas:** `instagram_medias` JOIN `instagram_medias_insights`
**Nota:** Campo bio_link_clicked (índice 8) = 0 porque é métrica de conta, não disponível em medias_insights.

```sql
SELECT
  DATE(m.timestamp) AS dt,
  CASE
    WHEN m.owner_id = '17841401582417980' THEN 'talliscgomes'
    WHEN m.owner_id = '17841449785498428' THEN 'alfredosoares'
    WHEN m.owner_id = '17841406803098285' THEN 'g4educacao'
    WHEN m.owner_id = '17841415113498958' THEN 'brunonardon'
    ELSE CAST(m.owner_id AS STRING)
  END AS username,
  SUM(CASE WHEN i.metric_name = 'reach' THEN CAST(i.value AS BIGINT) ELSE 0 END) AS reach,
  SUM(CASE WHEN i.metric_name = 'likes' THEN CAST(i.value AS BIGINT) ELSE 0 END) AS likes,
  SUM(CASE WHEN i.metric_name = 'comments' THEN CAST(i.value AS BIGINT) ELSE 0 END) AS comments,
  SUM(CASE WHEN i.metric_name = 'shares' THEN CAST(i.value AS BIGINT) ELSE 0 END) AS shares,
  SUM(CASE WHEN i.metric_name = 'saved' THEN CAST(i.value AS BIGINT) ELSE 0 END) AS saves,
  SUM(CASE WHEN i.metric_name = 'total_interactions' THEN CAST(i.value AS BIGINT) ELSE 0 END) AS total_interactions
FROM instagram_medias m
LEFT JOIN instagram_medias_insights i
  ON m.id = i.media_id AND i.period = 'lifetime'
WHERE m.media_product_type IN ('FEED', 'REELS')
  AND DATE(m.timestamp) >= '2026-01-31'
GROUP BY 1, 2
ORDER BY 1, 2
```

> Dados antes de 2026-01-31 vieram da extração original em `_libs.pkl` (tabela `instagram_account_insights`, não disponível no Genie).
> Para atualização incremental, usar `AND DATE(m.timestamp) >= '<última_data>'`.

---

## 4. Instagram Feed métricas diárias totais → `_instaRaw.json`

**Formato:** `[date, 0, reach, likes, comments, shares, saves, bio_link_clicked, total_interactions]`

**Derivado de:** Agregar `_instaPerfilRaw.json` somando todos os perfis por dia.

> Não precisa de query separada — calcular a partir do instaPerfilRaw.

---

## 5. Contagem de stories por dia/perfil → `_storiesRaw.json` e `_storyMetricsRaw.json` / `_storyMetricsPerfilRaw.json`

**storiesRaw formato:** `[date, username, count]`
**storyMetricsRaw formato:** `[date, reach, replies, shares, total_interactions, views]`
**storyMetricsPerfilRaw formato:** `[date, username, reach, replies, shares, total_interactions, views]`

**Derivados de:** Agregar `_storiesDetailRaw.json`:

```python
# storiesRaw: contagem por dia/perfil
# storyMetricsPerfilRaw: soma métricas por dia/perfil
# storyMetricsRaw: soma métricas por dia (todos perfis)
```

> Não precisam de query separada — calcular a partir do storiesDetailRaw.

---

## 6. MQL Raw / MQL Perfil / MQL Content → `_mqlRaw.json`, `_mqlPerfilRaw.json`, `_mqlContentRaw.json`, `_mqlPerfilContentRaw.json`

**Tabela:** `production.diamond.funil_marketing`

**Filtros base:**
- `camada_funil = 'negociacao_deal'`
- `event = 'mql'`
- `area_geracao_demanda = 'Social'`

**Mapeamento de campos:**
- **perfil** (`utm_medium`): `alfredo`, `tallis`, `g4`, `nardon` → direto; todo o resto → `outros`
- **tipo MQL** (`utm_content`): `bio` → bio, `stories` → stories, `NULL` ou qualquer outro valor → `outros`

### 6a. mqlRaw — total MQL por dia
**Formato:** `[date_str, count_str]`

```sql
SELECT DATE(event_at) AS dt, CAST(COUNT(*) AS STRING) AS cnt
FROM production.diamond.funil_marketing
WHERE camada_funil = 'negociacao_deal' AND event = 'mql'
  AND area_geracao_demanda = 'Social'
  AND DATE(event_at) >= '2025-01-01'
GROUP BY 1
ORDER BY 1
```

### 6b. mqlPerfilRaw — MQL por dia/perfil
**Formato:** `[date_str, perfil_str, count_str]` — perfis: alfredo, g4, nardon, outros, tallis

```sql
SELECT DATE(event_at) AS dt,
  CASE
    WHEN utm_medium IN ('alfredo','tallis','g4','nardon') THEN utm_medium
    ELSE 'outros'
  END AS perfil,
  CAST(COUNT(*) AS STRING) AS cnt
FROM production.diamond.funil_marketing
WHERE camada_funil = 'negociacao_deal' AND event = 'mql'
  AND area_geracao_demanda = 'Social'
  AND DATE(event_at) >= '2025-01-01'
GROUP BY 1, 2
ORDER BY 1, 2
```

### 6c. mqlContentRaw — MQL por dia/tipo
**Formato:** `[date_str, type_str, count_str]` — types: bio, stories, outros

```sql
SELECT DATE(event_at) AS dt,
  CASE
    WHEN utm_content = 'bio' THEN 'bio'
    WHEN utm_content = 'stories' THEN 'stories'
    ELSE 'outros'
  END AS tipo,
  CAST(COUNT(*) AS STRING) AS cnt
FROM production.diamond.funil_marketing
WHERE camada_funil = 'negociacao_deal' AND event = 'mql'
  AND area_geracao_demanda = 'Social'
  AND DATE(event_at) >= '2025-01-01'
GROUP BY 1, 2
ORDER BY 1, 2
```

### 6d. mqlPerfilContentRaw — MQL por dia/perfil/tipo
**Formato:** `[date_str, perfil_str, type_str, count_str]`

```sql
SELECT DATE(event_at) AS dt,
  CASE
    WHEN utm_medium IN ('alfredo','tallis','g4','nardon') THEN utm_medium
    ELSE 'outros'
  END AS perfil,
  CASE
    WHEN utm_content = 'bio' THEN 'bio'
    WHEN utm_content = 'stories' THEN 'stories'
    ELSE 'outros'
  END AS tipo,
  CAST(COUNT(*) AS STRING) AS cnt
FROM production.diamond.funil_marketing
WHERE camada_funil = 'negociacao_deal' AND event = 'mql'
  AND area_geracao_demanda = 'Social'
  AND DATE(event_at) >= '2025-01-01'
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3
```

---

## 7. Meta MQL (Targets) → `_metaMql.json`, `_metaMqlPerfil.json`

**metaMql formato:** `[date_str, float_value]`
**metaMqlPerfil formato:** `[date_str, pipeline_name_str, float_value]`

**⚠️ FONTE DESCONHECIDA:** Dados de metas/targets provavelmente vêm de uma planilha ou sistema externo, não do Genie. Os dados existentes vão até 2026-03-31.

---

## Scripts de processamento

| Script | Input | Output | Descrição |
|--------|-------|--------|-----------|
| `_process_posts_v2.py` | Genie batch JSONs | `_postsRaw.json` | Merge + dedup posts |
| `_process_stories_detail.py` | Genie batch JSONs | `_storiesDetailRaw.json` | Merge + dedup stories |
| `_patch_insta_perfil.py` | Genie data + existing JSON | `_instaPerfilRaw.json` | Append G4 feed metrics |
| `_rebuild.py` | Todos os JSONs + _libs.pkl | `dashboard_mql_social.html` | Build final dashboard |

---

## Fluxo de atualização

1. Executar queries incrementais no Genie (a partir da última data de cada dataset)
2. Processar/merge com dados existentes nos JSONs
3. Rodar `_rebuild.py` para gerar novo `dashboard_mql_social.html`
