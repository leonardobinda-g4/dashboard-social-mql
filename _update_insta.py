"""
Script to merge new posts and stories data into existing JSON files,
then regenerate derived files (instaRaw, storiesRaw, storyMetrics).
"""
import json

OWNER_MAP = {
    '17841401582417980': 'tallisgomes',
    '17841449785498428': 'alfredosoares',
    '17841406803098285': 'g4educacao',
    '17841415113498958': 'bruno.nardon',
    '17841401790220816': 'alfredosoares',
    '17841410743593080': 'g4educacao',
    '17841401694730077': 'tallisgomes',
    '17841443044221566': 'g4club_',
    '17841409389886260': 'bruno.nardon',
    '17841451164130731': 'g4scale',
    '17841450715885183': 'g4skills',
    '17841454542318840': 'g4podcasts',
    '17841474933215496': 'g4educacao',
}

def to_int(v):
    if v is None: return None
    try: return int(v)
    except: return None

# ── 1. Update postsRaw ──
print("=== Updating postsRaw ===")
with open('_postsRaw.json', encoding='utf-8') as f:
    posts = json.load(f)

with open('_genie_new_posts.json', encoding='utf-8') as f:
    new_posts_raw = json.load(f)

# Convert new posts to postsRaw format: [date, username, tipo, caption, permalink, reach, likes, comments, shares, saves, total_interactions]
new_posts = []
for r in new_posts_raw:
    dt = r[0][:10]  # timestamp to date
    owner_id = r[1]
    username = OWNER_MAP.get(owner_id, owner_id)
    tipo = r[2]
    caption = r[3]
    permalink = r[4]
    reach = to_int(r[5])
    likes = to_int(r[6])
    comments = to_int(r[7])
    shares = to_int(r[8])
    saves = to_int(r[9])
    total = to_int(r[10])
    new_posts.append([dt, username, tipo, caption, permalink, reach, likes, comments, shares, saves, total])

# Dedup by permalink keeping highest reach
best = {}
for r in posts + new_posts:
    perm = r[4]
    reach = r[5] if r[5] is not None else 0
    if perm not in best or reach > (best[perm][5] if best[perm][5] is not None else 0):
        best[perm] = r
posts = sorted(best.values(), key=lambda r: (r[0], r[1]))

with open('_postsRaw.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, separators=(',',':'), ensure_ascii=False)
print(f'postsRaw: {len(posts)} rows, {posts[0][0]} to {posts[-1][0]}')

# ── 2. Update storiesDetailRaw ──
print("\n=== Updating storiesDetailRaw ===")
with open('_storiesDetailRaw.json', encoding='utf-8') as f:
    stories = json.load(f)

with open('_genie_new_stories.json', encoding='utf-8') as f:
    new_stories_raw = json.load(f)

# Convert: input [pub_date, owner_id, permalink, caption, timestamp, reach, replies, shares, views, total_interactions]
# Output: [date, username, caption, permalink, reach, replies, shares, views, total_interactions]
new_stories = []
for r in new_stories_raw:
    dt = r[0][:10]
    owner_id = r[1]
    username = OWNER_MAP.get(owner_id, owner_id)
    permalink = r[2]
    caption = r[3]
    reach = to_int(r[5])
    replies = to_int(r[6])
    shares = to_int(r[7])
    views = to_int(r[8])
    total = to_int(r[9])
    new_stories.append([dt, username, caption, permalink, reach, replies, shares, views, total])

# Dedup by permalink keeping highest reach
best = {}
for r in stories + new_stories:
    perm = r[3]
    reach = r[4] if r[4] is not None else 0
    if perm not in best or reach > (best[perm][4] if best[perm][4] is not None else 0):
        best[perm] = r
stories = sorted(best.values(), key=lambda r: (r[0], r[1]))

with open('_storiesDetailRaw.json', 'w', encoding='utf-8') as f:
    json.dump(stories, f, separators=(',',':'), ensure_ascii=False)
print(f'storiesDetailRaw: {len(stories)} rows, {stories[0][0]} to {stories[-1][0]}')

# ── 3. Regenerate storiesRaw (count per day/profile) ──
print("\n=== Regenerating storiesRaw ===")
from collections import defaultdict
story_counts = defaultdict(int)
for r in stories:
    story_counts[(r[0], r[1])] += 1
stories_raw = sorted([[k[0], k[1], v] for k, v in story_counts.items()])
with open('_storiesRaw.json', 'w', encoding='utf-8') as f:
    json.dump(stories_raw, f, separators=(',',':'))
print(f'storiesRaw: {len(stories_raw)} rows')

# ── 4. Regenerate storyMetricsPerfilRaw (sum metrics per day/profile) ──
print("\n=== Regenerating storyMetricsPerfilRaw ===")
metrics_perfil = defaultdict(lambda: [0,0,0,0,0])  # reach, replies, shares, total, views
for r in stories:
    key = (r[0], r[1])
    metrics_perfil[key][0] += r[4] or 0  # reach
    metrics_perfil[key][1] += r[5] or 0  # replies
    metrics_perfil[key][2] += r[6] or 0  # shares
    metrics_perfil[key][3] += r[8] or 0  # total_interactions
    metrics_perfil[key][4] += r[7] or 0  # views
smp = sorted([[k[0], k[1], v[0], v[1], v[2], v[3], v[4]] for k, v in metrics_perfil.items()])
with open('_storyMetricsPerfilRaw.json', 'w', encoding='utf-8') as f:
    json.dump(smp, f, separators=(',',':'))
print(f'storyMetricsPerfilRaw: {len(smp)} rows')

# ── 5. Regenerate storyMetricsRaw (sum metrics per day, all profiles) ──
print("\n=== Regenerating storyMetricsRaw ===")
metrics_day = defaultdict(lambda: [0,0,0,0,0])
for r in stories:
    key = r[0]
    metrics_day[key][0] += r[4] or 0
    metrics_day[key][1] += r[5] or 0
    metrics_day[key][2] += r[6] or 0
    metrics_day[key][3] += r[8] or 0
    metrics_day[key][4] += r[7] or 0
sm = sorted([[k, v[0], v[1], v[2], v[3], v[4]] for k, v in metrics_day.items()])
with open('_storyMetricsRaw.json', 'w', encoding='utf-8') as f:
    json.dump(sm, f, separators=(',',':'))
print(f'storyMetricsRaw: {len(sm)} rows')

# ── 6. Regenerate instaRaw from instaPerfilRaw ──
print("\n=== Regenerating instaRaw ===")
with open('_instaPerfilRaw.json', encoding='utf-8') as f:
    ipd = json.load(f)
day_totals = defaultdict(lambda: [0,0,0,0,0,0,0])
for r in ipd:
    dt = r[0]
    day_totals[dt][0] += to_int(r[3]) or 0  # reach
    day_totals[dt][1] += to_int(r[4]) or 0  # likes
    day_totals[dt][2] += to_int(r[5]) or 0  # comments
    day_totals[dt][3] += to_int(r[6]) or 0  # shares
    day_totals[dt][4] += to_int(r[7]) or 0  # saves
    day_totals[dt][5] += to_int(r[8]) or 0  # bio_link
    day_totals[dt][6] += to_int(r[9]) or 0  # total_interactions
insta_raw = sorted([[k, 0, v[0], v[1], v[2], v[3], v[4], v[5], v[6]] for k, v in day_totals.items()])
with open('_instaRaw.json', 'w', encoding='utf-8') as f:
    json.dump(insta_raw, f, separators=(',',':'))
print(f'instaRaw: {len(insta_raw)} rows, {insta_raw[0][0]} to {insta_raw[-1][0]}')

# ── 7. Update instaPerfilRaw with new feed metrics from Genie ──
# (already done separately via _patch_insta_perfil.py if needed)

print("\n=== All Instagram files updated! ===")
