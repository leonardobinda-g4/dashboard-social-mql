"""
Build _spendPerPost.json from Genie query result.
Format: { permalink: total_spend_rounded }
This is used in the dashboard drilldown to show spend badges on boosted posts.
"""
import json

# Read from a temp file that contains the raw Genie data
# We'll construct it from the spend_perfil_raw daily data instead
# Actually we need the per-post data. Let's query it differently:
# We have _spendRaw.json (daily totals) and _spendPerfilRaw.json (daily by perfil)
# For the drilldown, we need spend per POST (permalink).
# Since we don't have that saved yet, we'll skip this for now
# and add spend as a daily line + KPI only.

# For now, just verify the daily files work
with open('_spendRaw.json', encoding='utf-8') as f:
    sr = json.load(f)
print(f'spendRaw: {len(sr)} rows, {sr[0][0]} to {sr[-1][0]}')
print(f'Sample: {sr[-3:]}')

with open('_spendPerfilRaw.json', encoding='utf-8') as f:
    spr = json.load(f)
print(f'spendPerfilRaw: {len(spr)} rows')

# Calculate total spend
total = sum(r[1] for r in sr)
print(f'Total spend all time: R$ {total:,.2f}')
