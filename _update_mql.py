"""
Script to update all MQL JSON files from Genie query results.
Run after extracting data from Genie space 01f12232b2be19c58ed16da7d88b0a69.
"""
import json

# ── mqlRaw ──
with open('_genie_mqlraw.json', encoding='utf-8') as f:
    data = json.load(f)
with open('_mqlRaw.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',',':'))
print(f'_mqlRaw.json: {len(data)} rows, {data[0][0]} to {data[-1][0]}')

# ── mqlPerfilRaw ──
with open(r'C:\Users\leonardo.binda_g4edu\.claude\projects\C--Users-leonardo-binda-g4edu-Documents-G4-Workspace\1da65afb-d364-4f5b-b8df-fb4087e620b4\tool-results\toolu_bdrk_01By9QL58zFwJ23imQ8jj9vp.json', encoding='utf-8') as f:
    raw = json.load(f)
parsed = json.loads(raw[0]['text'])
rows = parsed['result']['data_array']
with open('_mqlPerfilRaw.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, separators=(',',':'))
print(f'_mqlPerfilRaw.json: {len(rows)} rows')

# ── mqlContentRaw ── (from _genie_mqlcontent.json)
with open('_genie_mqlcontent.json', encoding='utf-8') as f:
    data = json.load(f)
with open('_mqlContentRaw.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',',':'))
print(f'_mqlContentRaw.json: {len(data)} rows')

# ── mqlPerfilContentRaw ── (from _genie_mqlperfilcontent.json)
with open('_genie_mqlperfilcontent.json', encoding='utf-8') as f:
    data = json.load(f)
with open('_mqlPerfilContentRaw.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',',':'))
print(f'_mqlPerfilContentRaw.json: {len(data)} rows')

print('\nAll MQL files updated!')
