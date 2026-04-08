-- =============================================================================
-- Dashboard MQL Social — Queries SQL para Databricks
-- Tabela principal: production.diamond.funil_marketing
-- Tabela Instagram: production.silver.instagram_medias
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. MQL POR DIA (total)
-- Substitui: mqlRaw.json → [date, mql_count]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(event_at) AS data,
  COUNT(*) AS mqls
FROM production.diamond.funil_marketing
WHERE area_geracao_demanda = 'Social'
  AND event = 'mql'
GROUP BY 1
ORDER BY 1;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MQL POR DIA + PERFIL
-- Substitui: mqlPerfilRaw.json → [date, perfil, mql_count]
-- Perfis principais: tallis, alfredo, g4, nardon
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(event_at) AS data,
  utm_medium AS perfil,
  COUNT(*) AS mqls
FROM production.diamond.funil_marketing
WHERE area_geracao_demanda = 'Social'
  AND event = 'mql'
GROUP BY 1, 2
ORDER BY 1, 2;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. MQL POR DIA + PERFIL + TIPO (bio/stories/outros)
-- Substitui: mqlPerfilContentRaw.json → [date, perfil, tipo, count]
-- Lógica de classificação do utm_content:
--   bio     = bio, bio-*, link_in_bio, bio-always-on
--   stories = stories, stories-*, story*, storie, storis, storiess
--   outros  = tudo que não é bio nem stories
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(event_at) AS data,
  utm_medium AS perfil,
  CASE
    WHEN utm_content = 'bio'
      OR utm_content LIKE 'bio-%'
      OR utm_content = 'link_in_bio'
      OR utm_content = 'bio-always-on'
    THEN 'bio'
    WHEN utm_content = 'stories'
      OR utm_content LIKE 'stories-%'
      OR utm_content LIKE 'story%'
      OR utm_content = 'storie'
      OR utm_content = 'storis'
      OR utm_content = 'storiess'
    THEN 'stories'
    ELSE 'outros'
  END AS tipo_mql,
  COUNT(*) AS mqls
FROM production.diamond.funil_marketing
WHERE area_geracao_demanda = 'Social'
  AND event = 'mql'
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MQL POR DIA (total, já com tipo agregado)
-- Alternativa simplificada que já entrega bio/stories/outros em colunas
-- Útil para o gráfico principal sem precisar de pivot no frontend
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(event_at) AS data,
  SUM(CASE
    WHEN utm_content = 'bio' OR utm_content LIKE 'bio-%'
      OR utm_content = 'link_in_bio' OR utm_content = 'bio-always-on'
    THEN 1 ELSE 0
  END) AS mql_bio,
  SUM(CASE
    WHEN utm_content = 'stories' OR utm_content LIKE 'stories-%'
      OR utm_content LIKE 'story%' OR utm_content = 'storie'
      OR utm_content = 'storis' OR utm_content = 'storiess'
    THEN 1 ELSE 0
  END) AS mql_stories,
  SUM(CASE
    WHEN utm_content NOT IN ('bio','stories','storie','storis','storiess')
      AND utm_content NOT LIKE 'bio-%'
      AND utm_content NOT LIKE 'stories-%'
      AND utm_content NOT LIKE 'story%'
      AND utm_content != 'link_in_bio'
      AND utm_content != 'bio-always-on'
    THEN 1 ELSE 0
  END) AS mql_outros,
  COUNT(*) AS mql_total
FROM production.diamond.funil_marketing
WHERE area_geracao_demanda = 'Social'
  AND event = 'mql'
GROUP BY 1
ORDER BY 1;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SPEND (IMPULSIONAMENTO) POR DIA
-- Substitui: spendRaw.json → [date, total_spend, posts_boosted]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(event_at) AS data,
  SUM(event_value) AS total_spend,
  COUNT(DISTINCT media_id) AS posts_boosted
FROM production.diamond.funil_marketing
WHERE area_geracao_demanda = 'Social'
  AND event = 'facebook_spend'
GROUP BY 1
ORDER BY 1;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SPEND POR DIA + PERFIL (baseado no owner do post)
-- Substitui: spendPerfilRaw.json → [date, perfil, total_spend, posts_boosted]
-- Faz JOIN com instagram_medias para mapear o owner_id do post
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(f.event_at) AS data,
  CASE
    WHEN CAST(m.owner_id AS STRING) = '17841401790220816' THEN 'alfredosoares'
    WHEN CAST(m.owner_id AS STRING) = '17841410743593080' THEN 'g4educacao'
    WHEN CAST(m.owner_id AS STRING) = '17841401694730077' THEN 'tallisgomes'
    WHEN CAST(m.owner_id AS STRING) = '17841409389886260' THEN 'bruno.nardon'
    ELSE 'outros'
  END AS perfil,
  SUM(f.event_value) AS total_spend,
  COUNT(DISTINCT f.media_id) AS posts_boosted
FROM production.diamond.funil_marketing f
LEFT JOIN production.silver.instagram_medias m ON f.media_id = m.id
WHERE f.area_geracao_demanda = 'Social'
  AND f.event = 'facebook_spend'
GROUP BY 1, 2
ORDER BY 1, 2;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SPEND POR POST (para badges no drilldown)
-- Substitui: spendPerPost.json → { permalink: total_spend }
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  m.permalink,
  SUM(f.event_value) AS total_spend
FROM production.diamond.funil_marketing f
JOIN production.silver.instagram_medias m ON f.media_id = m.id
WHERE f.area_geracao_demanda = 'Social'
  AND f.event = 'facebook_spend'
  AND m.permalink IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. POSTS INSTAGRAM (FEED + REELS) — para drilldown
-- Substitui: postsRaw.json → [date, username, type, caption, permalink, reach, likes, comments, shares, saves, total_interactions]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(m.timestamp) AS data,
  CASE
    WHEN CAST(m.owner_id AS STRING) = '17841401790220816' THEN 'alfredosoares'
    WHEN CAST(m.owner_id AS STRING) = '17841410743593080' THEN 'g4educacao'
    WHEN CAST(m.owner_id AS STRING) = '17841401694730077' THEN 'tallisgomes'
    WHEN CAST(m.owner_id AS STRING) = '17841409389886260' THEN 'bruno.nardon'
    WHEN CAST(m.owner_id AS STRING) = '17841443044221566' THEN 'g4club_'
    WHEN CAST(m.owner_id AS STRING) = '17841450715885183' THEN 'g4scale'
    WHEN CAST(m.owner_id AS STRING) = '17841451164130731' THEN 'g4skills'
    WHEN CAST(m.owner_id AS STRING) = '17841454542318840' THEN 'g4podcasts'
    ELSE CAST(m.owner_id AS STRING)
  END AS perfil,
  m.media_product_type AS tipo,
  m.caption,
  m.permalink,
  m.reach,
  m.like_count AS likes,
  m.comments_count AS comments,
  m.shares AS compartilhamentos,
  m.saved AS saves,
  m.total_interactions
FROM production.silver.instagram_medias m
WHERE m.media_product_type IN ('FEED', 'REELS')
  AND m.timestamp >= '2024-01-01'
ORDER BY 1 DESC, 2;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. MÉTRICAS INSTAGRAM POR DIA (total, FEED only)
-- Substitui: instaRaw.json → [date, post_count, reach, likes, comments, shares, saves, bio_link_clicked, total_interactions]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(m.timestamp) AS data,
  COUNT(*) AS post_count,
  SUM(m.reach) AS reach,
  SUM(m.like_count) AS likes,
  SUM(m.comments_count) AS comments,
  SUM(m.shares) AS compartilhamentos,
  SUM(m.saved) AS saves,
  SUM(COALESCE(m.bio_link_clicked, 0)) AS bio_link_clicked,
  SUM(m.total_interactions) AS total_interactions
FROM production.silver.instagram_medias m
WHERE m.media_product_type IN ('FEED', 'REELS')
  AND m.timestamp >= '2024-01-01'
GROUP BY 1
ORDER BY 1;


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. MÉTRICAS INSTAGRAM POR DIA + PERFIL (FEED only)
-- Substitui: instaPerfilRaw.json → [date, username, reach, likes, comments, shares, saves, bio_link_clicked, total_interactions, post_count]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(m.timestamp) AS data,
  CASE
    WHEN CAST(m.owner_id AS STRING) = '17841401790220816' THEN 'alfredosoares'
    WHEN CAST(m.owner_id AS STRING) = '17841410743593080' THEN 'g4educacao'
    WHEN CAST(m.owner_id AS STRING) = '17841401694730077' THEN 'tallisgomes'
    WHEN CAST(m.owner_id AS STRING) = '17841409389886260' THEN 'bruno.nardon'
    WHEN CAST(m.owner_id AS STRING) = '17841443044221566' THEN 'g4club_'
    WHEN CAST(m.owner_id AS STRING) = '17841450715885183' THEN 'g4scale'
    WHEN CAST(m.owner_id AS STRING) = '17841451164130731' THEN 'g4skills'
    ELSE CAST(m.owner_id AS STRING)
  END AS perfil,
  SUM(m.reach) AS reach,
  SUM(m.like_count) AS likes,
  SUM(m.comments_count) AS comments,
  SUM(m.shares) AS compartilhamentos,
  SUM(m.saved) AS saves,
  SUM(COALESCE(m.bio_link_clicked, 0)) AS bio_link_clicked,
  SUM(m.total_interactions) AS total_interactions,
  COUNT(*) AS post_count
FROM production.silver.instagram_medias m
WHERE m.media_product_type IN ('FEED', 'REELS')
  AND m.timestamp >= '2024-01-01'
GROUP BY 1, 2
ORDER BY 1, 2;


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. STORIES — métricas por dia (total)
-- Substitui: storyMetricsRaw.json → [date, reach, replies, shares, total_interactions, views]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(m.timestamp) AS data,
  SUM(m.reach) AS reach,
  SUM(m.replies) AS replies,
  SUM(m.shares) AS compartilhamentos,
  SUM(m.total_interactions) AS total_interactions,
  SUM(COALESCE(m.views, 0)) AS views
FROM production.silver.instagram_medias m
WHERE m.media_product_type = 'STORY'
  AND m.timestamp >= '2024-01-01'
GROUP BY 1
ORDER BY 1;


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. STORIES — métricas por dia + perfil
-- Substitui: storyMetricsPerfilRaw.json → [date, username, reach, replies, shares, total_interactions, views]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(m.timestamp) AS data,
  CASE
    WHEN CAST(m.owner_id AS STRING) = '17841401790220816' THEN 'alfredosoares'
    WHEN CAST(m.owner_id AS STRING) = '17841410743593080' THEN 'g4educacao'
    WHEN CAST(m.owner_id AS STRING) = '17841401694730077' THEN 'tallisgomes'
    WHEN CAST(m.owner_id AS STRING) = '17841409389886260' THEN 'bruno.nardon'
    WHEN CAST(m.owner_id AS STRING) = '17841443044221566' THEN 'g4club_'
    WHEN CAST(m.owner_id AS STRING) = '17841450715885183' THEN 'g4scale'
    WHEN CAST(m.owner_id AS STRING) = '17841451164130731' THEN 'g4skills'
    ELSE CAST(m.owner_id AS STRING)
  END AS perfil,
  SUM(m.reach) AS reach,
  SUM(m.replies) AS replies,
  SUM(m.shares) AS compartilhamentos,
  SUM(m.total_interactions) AS total_interactions,
  SUM(COALESCE(m.views, 0)) AS views
FROM production.silver.instagram_medias m
WHERE m.media_product_type = 'STORY'
  AND m.timestamp >= '2024-01-01'
GROUP BY 1, 2
ORDER BY 1, 2;


-- ─────────────────────────────────────────────────────────────────────────────
-- 13. STORIES — contagem por dia + perfil
-- Substitui: storiesRaw.json → [date, username, story_count]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(m.timestamp) AS data,
  CASE
    WHEN CAST(m.owner_id AS STRING) = '17841401790220816' THEN 'alfredosoares'
    WHEN CAST(m.owner_id AS STRING) = '17841410743593080' THEN 'g4educacao'
    WHEN CAST(m.owner_id AS STRING) = '17841401694730077' THEN 'tallisgomes'
    WHEN CAST(m.owner_id AS STRING) = '17841409389886260' THEN 'bruno.nardon'
    WHEN CAST(m.owner_id AS STRING) = '17841443044221566' THEN 'g4club_'
    WHEN CAST(m.owner_id AS STRING) = '17841450715885183' THEN 'g4scale'
    WHEN CAST(m.owner_id AS STRING) = '17841451164130731' THEN 'g4skills'
    ELSE CAST(m.owner_id AS STRING)
  END AS perfil,
  COUNT(*) AS story_count
FROM production.silver.instagram_medias m
WHERE m.media_product_type = 'STORY'
  AND m.timestamp >= '2024-01-01'
GROUP BY 1, 2
ORDER BY 1, 2;


-- ─────────────────────────────────────────────────────────────────────────────
-- 14. STORIES DETAIL (para drilldown individual)
-- Substitui: storiesDetailRaw.json → [date, username, caption, permalink, reach, replies, shares, views, total_interactions]
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  DATE(m.timestamp) AS data,
  CASE
    WHEN CAST(m.owner_id AS STRING) = '17841401790220816' THEN 'alfredosoares'
    WHEN CAST(m.owner_id AS STRING) = '17841410743593080' THEN 'g4educacao'
    WHEN CAST(m.owner_id AS STRING) = '17841401694730077' THEN 'tallisgomes'
    WHEN CAST(m.owner_id AS STRING) = '17841409389886260' THEN 'bruno.nardon'
    WHEN CAST(m.owner_id AS STRING) = '17841443044221566' THEN 'g4club_'
    WHEN CAST(m.owner_id AS STRING) = '17841450715885183' THEN 'g4scale'
    WHEN CAST(m.owner_id AS STRING) = '17841451164130731' THEN 'g4skills'
    ELSE CAST(m.owner_id AS STRING)
  END AS perfil,
  m.caption,
  m.permalink,
  m.reach,
  m.replies,
  m.shares AS compartilhamentos,
  COALESCE(m.views, 0) AS views,
  m.total_interactions
FROM production.silver.instagram_medias m
WHERE m.media_product_type = 'STORY'
  AND m.timestamp >= '2024-01-01'
ORDER BY 1 DESC, 2;


-- =============================================================================
-- OWNER_MAP (referência)
-- =============================================================================
-- 17841401790220816 = alfredosoares
-- 17841410743593080 = g4educacao
-- 17841401694730077 = tallisgomes
-- 17841409389886260 = bruno.nardon (brunonardon)
-- 17841443044221566 = g4club_
-- 17841450715885183 = g4scale
-- 17841451164130731 = g4skills
-- 17841454542318840 = g4podcasts
-- =============================================================================

-- COLUNAS-CHAVE da tabela production.diamond.funil_marketing:
-- event_at (TIMESTAMP) — data do evento
-- event (STRING) — 'mql', 'facebook_spend', etc.
-- event_value (DOUBLE) — valor (spend em R$)
-- utm_medium (STRING) — perfil: g4, tallis, alfredo, nardon, g4skills, etc.
-- utm_content (STRING) — tipo: bio, stories, + centenas de UTMs de campanha
-- area_geracao_demanda (STRING) — = 'Social' para filtrar MQL social
-- linha_de_receita_vigente (STRING) — ex: 'Form G4 Instagram Tallis'
-- media_id (STRING) — ID do post Instagram (faz JOIN com instagram_medias.id)
-- lead_id (STRING) — ID do lead

-- COLUNAS-CHAVE da tabela production.silver.instagram_medias:
-- id (STRING) — media_id
-- owner_id (BIGINT) — ID do dono do perfil Instagram
-- timestamp (TIMESTAMP) — data de publicação
-- media_product_type (STRING) — 'FEED', 'REELS', 'STORY'
-- permalink (STRING) — URL do post
-- caption (STRING) — texto do post
-- reach, like_count, comments_count, shares, saved, total_interactions (INT)
-- bio_link_clicked (INT) — cliques no link da bio
-- replies (INT) — respostas (stories)
-- views (INT) — visualizações (stories)
-- username (STRING) — ⚠️ MASCARADO como '***', não usar! Use owner_id + OWNER_MAP
