# Dashboard MQL Social

Dashboard interativo que cruza dados de **MQL (Marketing Qualified Leads)** com **métricas do Instagram** e **spend de impulsionamento** para a área Social da G4 Educação.

## Screenshot

Abra `dashboard_mql_social.html` no navegador para visualizar.

## Arquitetura

O dashboard é um **HTML single-file** gerado por `_rebuild.py`, que combina:

| Arquivo | Descrição |
|---------|-----------|
| `_style.css` | Estilos (Manrope font, layout responsivo, tema G4) |
| `_body.html` | Estrutura HTML (controles, chart, drilldown) |
| `_logic.js` | Lógica JS (Chart.js, filtros, KPIs, drilldown) |
| `_rebuild.py` | Build script — injeta dados JSON no HTML final |

### Dados (JSON)

| Arquivo | Conteúdo |
|---------|----------|
| `_mqlRaw.json` | MQL diário (totais) |
| `_mqlPerfilRaw.json` | MQL diário por perfil |
| `_mqlContentRaw.json` | MQL por tipo (bio/stories/outros) |
| `_mqlPerfilContentRaw.json` | MQL por tipo × perfil |
| `_metaMql.json` | Metas MQL |
| `_metaMqlPerfil.json` | Metas MQL por linha de receita |
| `_instaRaw.json` | Métricas Instagram Feed (totais) |
| `_instaPerfilRaw.json` | Métricas Instagram Feed por perfil |
| `_postsRaw.json` | Posts individuais (feed + reels) |
| `_storiesRaw.json` | Contagem de stories por perfil/dia |
| `_storyMetricsRaw.json` | Métricas de stories (totais) |
| `_storyMetricsPerfilRaw.json` | Métricas de stories por perfil |
| `_storiesDetailRaw.json` | Stories individuais com métricas |
| `_spendRaw.json` | Spend de impulsionamento diário |
| `_spendPerfilRaw.json` | Spend por perfil/dia |
| `_spendPerPost.json` | Spend total por post (permalink → R$) |

### Scripts de atualização

| Script | Função |
|--------|--------|
| `_update_mql.py` | Atualiza dados MQL via Databricks |
| `_update_insta.py` | Atualiza métricas Instagram via Databricks |
| `_save_spend.py` | Extrai dados de spend (facebook_spend) |
| `_save_mql_content.py` | Gera breakdown bio/stories/outros |
| `_rebuild.py` | Gera o HTML final |

## Como usar

### Pré-requisitos

- Python 3.10+
- `_libs.pkl` com Chart.js, Hammer.js e chartjs-plugin-zoom (não versionado)

### Rebuild

```bash
python _rebuild.py
```

Gera `dashboard_mql_social.html` (~9MB, self-contained).

### Atualizar dados

Os scripts `_update_*.py` e `_save_*.py` dependem de acesso ao Databricks (Genie MCP). As queries SQL estão documentadas em `_queries.md`.

## Features

- **Chart interativo** com zoom/pan (Chart.js + Hammer.js)
- **Barras empilhadas** MQL (Bio + Stories + Outros) com linha de meta
- **Métricas Feed/Stories** toggleáveis como linhas no gráfico
- **Spend de impulsionamento** como métrica de feed
- **Filtros**: período, perfil, tipo MQL
- **Drilldown**: clique em um dia para ver posts/stories individuais com métricas
- **Badge de impulsionamento**: posts com spend mostram o valor investido
- **KPIs**: Meta MQL, Total MQL, Atingimento %, Spend Impulsionado

## Fonte de dados

- **MQL**: `production.diamond.funil_marketing` (Databricks)
- **Instagram**: `production.silver.instagram_medias` + `instagram_insights` (Databricks)
- **Spend**: `production.diamond.funil_marketing` onde `event = 'facebook_spend'`
- **Metas**: `production.gold.metas_mql` (Databricks)

## Licença

MIT
