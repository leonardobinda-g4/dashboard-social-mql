"""Save spend-per-post lookup: { permalink: total_spend_rounded }"""
import json

# From Genie query result - 349 rows: [media_id, permalink, owner_id, total_spend, spend_days, first_spend, last_spend]
# We just need permalink -> total_spend for the drilldown badge
raw = PASTE_DATA  # will be replaced

lookup = {}
for r in raw:
    permalink = r[1]
    spend = round(r[3], 2) if r[3] else 0
    if permalink:
        lookup[permalink] = spend

with open('_spendPerPost.json', 'w', encoding='utf-8') as f:
    json.dump(lookup, f, separators=(',', ':'), ensure_ascii=True)
print(f'Saved {len(lookup)} post spend entries')
