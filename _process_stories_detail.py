import json, os

BASE = r'C:\Users\leonardo.binda_g4edu\.claude\projects\C--Users-leonardo-binda-g4edu-Documents-G4-Workspace\1da65afb-d364-4f5b-b8df-fb4087e620b4\tool-results'

batch_files = [
    'toolu_bdrk_016XUY2oYjMzZgxUytBdMRWK.json',  # batch1: 2025-01-01 to 2025-02-14
    'toolu_bdrk_01YBw1hcoQsMujy2qjq4WzNH.json',  # batch2: 2025-02-14 to 2025-04-05
    'toolu_bdrk_01RBkvp3YkG6Cceg5cweCT74.json',   # batch3: 2025-04-05 to 2025-05-20
    'toolu_bdrk_01MTUdLTMSH9eYENoo47FG61.json',   # batch4: 2025-05-20 to 2025-07-05
    'toolu_bdrk_017XoD3Eo7zboSmFmbZgN4Fx.json',   # batch5: 2025-07-05 to 2025-08-20
    'toolu_bdrk_01YMwJ82dZTTZNXKMcvSZPSc.json',   # batch6: 2025-08-20 to 2025-10-05
    'toolu_bdrk_01Up6ixvfpj3s4JTuASCcWP3.json',   # batch7: 2025-10-05 to 2025-11-18
    'toolu_bdrk_01D9PUCbHL5yMpjCzt8WPQUG.json',   # batch8: 2025-11-18 to 2026-01-05
    'toolu_bdrk_01AmwrwaJ1uZMTVnvt6Wd9et.json',   # batch9: 2026-01-05 to 2026-02-20
    'toolu_bdrk_01FdADLTXrvF8CG95cUh1hva.json',   # batch10: 2026-02-20 to 2026-04-06
]

all_rows = []
for bf in batch_files:
    path = os.path.join(BASE, bf)
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    parsed = json.loads(data[0]['text'])
    rows = parsed['result']['data_array']
    all_rows.extend(rows)
    print(f'{bf}: {len(rows)} rows')

print(f'\nTotal raw rows: {len(all_rows)}')

# Deduplicate by permalink — keep row with highest reach (most complete metrics)
# Format: [dt, uname, permalink, caption, ts, reach, replies, shares, views, total_interactions]
best = {}
for r in all_rows:
    perm = r[2]
    reach = int(r[5]) if r[5] is not None else 0
    if perm not in best or reach > (int(best[perm][5]) if best[perm][5] is not None else 0):
        best[perm] = r

deduped = sorted(best.values(), key=lambda r: (r[0], r[4]))
print(f'After dedup: {len(deduped)} unique stories')

# Output format: [date, username, caption, permalink, reach, replies, shares, views, total_interactions]
# (drop ts, reorder)
output = []
for r in deduped:
    output.append([
        r[0],           # date
        r[1],           # username
        r[3],           # caption
        r[2],           # permalink
        int(r[5]) if r[5] is not None else None,  # reach
        int(r[6]) if r[6] is not None else None,  # replies
        int(r[7]) if r[7] is not None else None,  # shares
        int(r[8]) if r[8] is not None else None,  # views
        int(r[9]) if r[9] is not None else None,  # total_interactions
    ])

with open('_storiesDetailRaw.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

print(f'Saved _storiesDetailRaw.json ({len(output)} stories)')
print(f'Date range: {output[0][0]} to {output[-1][0]}')

# Check some usernames
users = set(r[1] for r in output)
print(f'Usernames: {sorted(users)}')
