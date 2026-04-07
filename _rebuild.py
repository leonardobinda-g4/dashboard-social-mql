import pickle, json, sys
sys.stdout.reconfigure(encoding="utf-8")

with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_libs.pkl", "rb") as f:
    d = pickle.load(f)

data = d["data"].rstrip()
lines = data.split("\n")
while lines and lines[-1].strip().startswith("//"):
    lines.pop()
data_section = "\n".join(lines)

# Inject mqlRaw (updated with March data)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_mqlRaw.json", encoding="utf-8") as f:
    mql_rows = json.load(f)
# Replace mqlRaw in data_section
import re

def replace_js_const(src, const_name, new_value_js):
    pat = re.compile(r'const ' + re.escape(const_name) + r'\s*=\s*\[', re.DOTALL)
    m = pat.search(src)
    if not m:
        return src + f'\nconst {const_name} = {new_value_js};'
    start = m.start()
    # find matching closing bracket
    depth = 0
    i = m.end() - 1  # position of opening [
    while i < len(src):
        if src[i] == '[': depth += 1
        elif src[i] == ']':
            depth -= 1
            if depth == 0:
                # find the semicolon after ]
                end = i + 1
                while end < len(src) and src[end] in ' \t\r\n': end += 1
                if end < len(src) and src[end] == ';': end += 1
                return src[:start] + f'const {const_name} = {new_value_js};' + src[end:]
        i += 1
    return src

mql_js = json.dumps(mql_rows, separators=(',',''))
data_section = replace_js_const(data_section, 'mqlRaw', mql_js)

# Inject mqlPerfilRaw (updated with March data)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_mqlPerfilRaw.json", encoding="utf-8") as f:
    mql_perfil_rows = json.load(f)
mql_perfil_js = json.dumps(mql_perfil_rows, separators=(',',''))
data_section = replace_js_const(data_section, 'mqlPerfilRaw', mql_perfil_js)

# Inject mqlContentRaw (bio/stories/outros breakdown - totals, kept for compatibility)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_mqlContentRaw.json", encoding="utf-8") as f:
    mql_content_rows = json.load(f)
mql_content_js = json.dumps(mql_content_rows, separators=(',',''))
if 'const mqlContentRaw' in data_section:
    data_section = replace_js_const(data_section, 'mqlContentRaw', mql_content_js)
else:
    data_section += f'\nconst mqlContentRaw = {mql_content_js};'

# Inject mqlPerfilContentRaw (bio/stories/outros por perfil - used for profile filtering)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_mqlPerfilContentRaw.json", encoding="utf-8") as f:
    mql_perfil_content_rows = json.load(f)
mql_perfil_content_js = json.dumps(mql_perfil_content_rows, separators=(',',''))
data_section += f'\nconst mqlPerfilContentRaw = {mql_perfil_content_js};'

# Inject metaRaw
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_metaMql.json", encoding="utf-8") as f:
    meta_rows = json.load(f)
meta_js = json.dumps(meta_rows, separators=(',',''))
data_section += f"\nconst metaRaw = {meta_js};"

# Inject metaPerfilRaw
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_metaMqlPerfil.json", encoding="utf-8") as f:
    meta_perfil_rows = json.load(f)
meta_perfil_js = json.dumps(meta_perfil_rows, separators=(',',''))
data_section += f"\nconst metaPerfilRaw = {meta_perfil_js};"

# Inject instaRaw (Instagram daily totals - FEED only)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_instaRaw.json", encoding="utf-8") as f:
    insta_rows = json.load(f)
insta_js = json.dumps(insta_rows, separators=(',',''))
data_section = replace_js_const(data_section, 'instaRaw', insta_js)

# Inject instaPerfilRaw (Instagram daily per-profile - FEED only)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_instaPerfilRaw.json", encoding="utf-8") as f:
    insta_perfil_rows = json.load(f)
insta_perfil_js = json.dumps(insta_perfil_rows, separators=(',',''))
data_section = replace_js_const(data_section, 'instaPerfilRaw', insta_perfil_js)

# Inject postsRaw (FEED+REELS posts for drilldown)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_postsRaw.json", encoding="utf-8") as f:
    posts_rows = json.load(f)
posts_js = json.dumps(posts_rows, separators=(',',':'))
data_section += f"\nconst postsRaw = {posts_js};"

# Inject storiesRaw (daily story counts for drilldown)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_storiesRaw.json", encoding="utf-8") as f:
    stories_rows = json.load(f)
stories_js = json.dumps(stories_rows, separators=(',',':'))
data_section += f"\nconst storiesRaw = {stories_js};"

# Inject storyMetricsRaw (daily story engagement metrics for chart)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_storyMetricsRaw.json", encoding="utf-8") as f:
    story_metrics_rows = json.load(f)
story_metrics_js = json.dumps(story_metrics_rows, separators=(',',':'))
data_section += f"\nconst storyMetricsRaw = {story_metrics_js};"

# Inject storyMetricsPerfilRaw (daily story engagement per profile)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_storyMetricsPerfilRaw.json", encoding="utf-8") as f:
    story_mp_rows = json.load(f)
story_mp_js = json.dumps(story_mp_rows, separators=(',',':'))
data_section += f"\nconst storyMetricsPerfilRaw = {story_mp_js};"

# Inject storiesDetailRaw (individual stories with metrics for drilldown)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_storiesDetailRaw.json", encoding="utf-8") as f:
    stories_detail_rows = json.load(f)
stories_detail_js = json.dumps(stories_detail_rows, separators=(',',':'), ensure_ascii=False)
data_section += f"\nconst storiesDetailRaw = {stories_detail_js};"

# Inject spendRaw (daily spend totals)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_spendRaw.json", encoding="utf-8") as f:
    spend_rows = json.load(f)
spend_js = json.dumps(spend_rows, separators=(',',':'))
data_section += f"\nconst spendRaw = {spend_js};"

# Inject spendPerfilRaw (daily spend per profile)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_spendPerfilRaw.json", encoding="utf-8") as f:
    spend_perfil_rows = json.load(f)
spend_perfil_js = json.dumps(spend_perfil_rows, separators=(',',':'))
data_section += f"\nconst spendPerfilRaw = {spend_perfil_js};"

# Inject spendPerPost (permalink -> total_spend lookup for drilldown badges)
with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_spendPerPost.json", encoding="utf-8") as f:
    spend_post = json.load(f)
spend_post_js = json.dumps(spend_post, separators=(',',':'))
data_section += f"\nconst spendPerPost = {spend_post_js};"

STYLE = open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_style.css", encoding="utf-8").read()
BODY = open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_body.html", encoding="utf-8").read()
JS = open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/_logic.js", encoding="utf-8").read()

new_html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MQL Social x Instagram</title>
<script>{d["hammer"]}</script>
<script>{d["chartjs"]}</script>
<script>{d["zoom"]}</script>
<style>{STYLE}</style>
</head>
<body>
{BODY}
<script>
{data_section}
{JS}
</script>
</body>
</html>"""

with open(r"C:/Users/leonardo.binda_g4edu/Documents/G4-Workspace/dashboard_mql_social.html", "w", encoding="utf-8") as f:
    f.write(new_html)
print(f"Written: {len(new_html):,} chars")
