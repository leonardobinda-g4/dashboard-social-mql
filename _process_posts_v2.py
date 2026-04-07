import json

def load_batch(path):
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    data = json.loads(raw[0]["text"])
    return data["result"]["data_array"]

batch1 = load_batch(r"C:\Users\leonardo.binda_g4edu\.claude\projects\C--Users-leonardo-binda-g4edu-Documents-G4-Workspace\1da65afb-d364-4f5b-b8df-fb4087e620b4\tool-results\toolu_bdrk_01SSMhaDj3te85HcdbwpVM8F.json")
batch2 = load_batch(r"C:\Users\leonardo.binda_g4edu\.claude\projects\C--Users-leonardo-binda-g4edu-Documents-G4-Workspace\1da65afb-d364-4f5b-b8df-fb4087e620b4\tool-results\toolu_bdrk_015c4f5NZ3cNsg3xbZLYRVVo.json")

print(f"Batch 1: {len(batch1)} rows, Batch 2: {len(batch2)} rows")

# Merge and dedupe by permalink
seen = set()
output = []
for r in batch1 + batch2:
    key = r[4]  # permalink
    if not key or key in seen:
        continue
    seen.add(key)
    output.append([
        r[0],  # date
        r[1],  # username
        r[2],  # tipo (FEED/REELS)
        r[3],  # caption (120 chars)
        r[4],  # permalink
        int(r[5]) if r[5] else 0,  # reach
        int(r[6]) if r[6] else 0,  # likes
        int(r[7]) if r[7] else 0,  # comments
        int(r[8]) if r[8] else 0,  # shares
        int(r[9]) if r[9] else 0,  # saves
        int(r[10]) if r[10] else 0,  # total_interactions
    ])

# Sort by date, username
output.sort(key=lambda r: (r[0], r[1]))

print(f"Total unique posts: {len(output)}")
print(f"Date range: {output[0][0]} to {output[-1][0]}")
print(f"Types: {set(r[2] for r in output)}")
print(f"Usernames: {sorted(set(r[1] for r in output))}")

# Save - overwrite postsRaw with new format (11 fields instead of 7)
with open("_postsRaw.json", "w", encoding="utf-8") as f:
    json.dump(output, f, separators=(",", ":"), ensure_ascii=False)

print(f"Saved _postsRaw.json ({len(output)} posts)")
