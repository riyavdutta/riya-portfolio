#!/usr/bin/env python3
"""Build the case study pages and the work index from content/.

    python3 tools/build.py

content/cases/<slug>.json  ->  work/<slug>/index.html
content/work.json          ->  work/index.html

Strings in the content files are trusted HTML (they're written for this site); post captions are escaped.
"""
import html, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE_URL = 'https://riyavdutta.github.io/riya-portfolio/'
LINKEDIN = 'https://www.linkedin.com/in/riyaa-duttaa'
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&amp;family=Space+Mono:wght@400;700&amp;family=Work+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet">')
esc = html.escape


def head(title, desc, root, path):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{SITE_URL}assets/og.jpg">
<meta property="og:url" content="{SITE_URL}{path}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{SITE_URL}{path}">
<link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="{root}assets/case.css">
<link rel="stylesheet" href="{root}assets/stickers.css">
</head>
<body>
'''


def top(root, work_href, current_work=True):
    cur = ' aria-current="page"' if current_work else ''
    return f'''<div class="top"><div class="wrap">
<a class="top__name" href="{root}">Riya Dutta</a>
<nav aria-label="Main"><a href="{work_href}"{cur}>Work</a><a class="ul" href="{root}#about">About</a><a class="ul" href="{root}#catalogue">Records</a><a class="ul" href="{root}#contact">Contact</a><a class="ul" href="{LINKEDIN}" rel="me">LinkedIn</a></nav>
</div></div>
'''


def track(no):
    stops = ''.join(f'<span class="track__stop"><i></i><span>{t}</span></span>' for t in ('Posted', 'Sorted', 'In transit', 'Delivered'))
    return (f'<div class="track" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="wrap">'
            f'<span class="mono">TRACKING · No. {no}</span><span class="track__rail"><span class="track__line"><span class="track__fill"></span></span>{stops}</span></div></div>\n')


def foot(root):
    return (f'<footer class="foot"><div class="wrap"><span>Riya Dutta · 2026</span>'
            f'<span><a class="ul" href="{root}#contact">Contact</a> · <a class="ul" href="{LINKEDIN}" rel="me">LinkedIn</a></span></div></footer>\n'
            f'<script src="{root}assets/case.js"></script>\n<script src="{root}assets/stickers.js"></script>\n</body>\n</html>\n')


def postmark(text, year):
    return (f'<svg class="pm" aria-hidden="true" viewBox="0 0 150 150"><defs><path id="pmr" d="M75,75 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0"/></defs>'
            f'<circle cx="75" cy="75" r="66" fill="none" stroke="#65232b" stroke-width="2" opacity=".85"/><circle cx="75" cy="75" r="38" fill="none" stroke="#65232b" stroke-width="1.5" opacity=".85"/>'
            f'<text font-family="Space Mono, monospace" font-size="11" letter-spacing="2" fill="#65232b"><textPath href="#pmr">{esc(text)}</textPath></text>'
            f'<text x="75" y="83" text-anchor="middle" font-family="Playfair Display, serif" font-size="27" fill="#65232b">{esc(year)}</text></svg>')


def asset(root, p):
    return p if p.startswith(('http', '/')) else root + p


# ---------------------------------------------------------------- sections

def kick_title(s):
    out = f'<span class="kick">{s["kick"]}</span>' if s.get('kick') else ''
    return out + (f'<h2 class="h2">{s["title"]}</h2>' if s.get('title') else '')


def links(s, root):
    if not s.get('links'):
        return ''
    ext = ' target="_blank" rel="noopener"'
    a = ''.join(f'<a class="btn{" btn--line" if i else ""}" href="{asset(root, l["href"])}"{ext if l["href"].startswith("http") else ""}>{l["label"]}</a>' for i, l in enumerate(s['links']))
    return f'<div class="links">{a}</div>'


def sec_cards(s, root):
    cards = ''.join(f'<div class="card" style="background: var(--{c.get("bg", "blush")})"><span class="kick" style="margin:0">{c["k"]}</span><p>{c["t"]}</p></div>' for c in s['items'])
    return f'<section>{kick_title(s)}<div class="cards">{cards}</div></section>'


def sec_statement(s, root):
    tiles = ''.join(f'<div class="tile"><b>{i + 1:02d}</b><strong>{t["t"]}</strong><span>{t["d"]}</span></div>' for i, t in enumerate(s.get('tiles', [])))
    lead = f'<p class="lead">{s["lead"]}</p>' if s.get('lead') else ''
    paras = ''.join(f'<p class="copy">{p}</p>' for p in s.get('paras', []))
    close = f'<p class="copy close">{s["close"]}</p>' if s.get('close') else ''
    grid = f'<div class="grid">{tiles}</div>' if tiles else ''
    return f'<section>{kick_title(s)}{lead}{paras}{grid}{close}{links(s, root)}</section>'


def sec_rules(s, root):
    items = ''.join(f'<li><b>{i + 1:02d}</b><strong>{r["t"]}</strong><span>{r["d"]}</span></li>' for i, r in enumerate(s['items']))
    intro = f'<p class="copy">{s["intro"]}</p>' if s.get('intro') else ''
    return f'<section class="split"><div>{kick_title(s)}{intro}</div><ol class="rules">{items}</ol></section>'


def sec_chapters(s, root):
    items = ''.join(f'<div class="chapter" style="--c: {c.get("c", "var(--cherry)")}"><b>{c["when"]}</b><strong>{c["t"]}</strong><span>{c["d"]}</span></div>' for c in s['items'])
    intro = f'<p class="copy" style="margin-bottom:26px">{s["intro"]}</p>' if s.get('intro') else ''
    return f'<section>{kick_title(s)}{intro}<div class="chapters">{items}</div></section>'


def sec_sheet(s, root):
    items = []
    for it in s['items']:
        d = {k: it[k] for k in ('no', 'title', 'fmt', 'when', 'text', 'link') if it.get(k)}
        d['img'] = asset(root, it['img'])
        if it.get('video'):
            d['video'] = asset(root, it['video'])
        if it.get('slides'):
            d['slides'] = [asset(root, x) for x in it['slides']]
        items.append(d)
    ar, mn, mw = s.get('aspect', '4 / 5'), s.get('min', '96px'), s.get('mw', '320px')
    fmt_tag = lambda it: f'<i>{esc(it["fmt"].upper())}</i>' if it.get('fmt') else ''
    stamps = ''.join(f'<button type="button" class="stamp" aria-pressed="{"true" if i == 0 else "false"}" aria-label="{esc(it["no"])} {esc(it["title"])}{", " + esc(it["fmt"].lower()) if it.get("fmt") else ""}">'
                     f'<span class="perf-s"><img src="{it["img"]}" alt="" loading="lazy"></span><em>{esc(it["no"])}</em>{fmt_tag(it)}</button>' for i, it in enumerate(items))
    f0 = items[0]
    link = '<a class="view__link" href="#" target="_blank" rel="noopener" hidden>Open the live page ↗</a>' if any(i.get('link') for i in items) else ''
    data = json.dumps(items, ensure_ascii=False).replace('</', '<\\/')
    intro = f'<p class="copy" style="margin-bottom:30px">{s["intro"]}</p>' if s.get('intro') else ''
    return f'''<section data-sheet style="--ar: {ar}; --min: {mn}; --mw: {mw}">{kick_title(s)}{intro}
<div class="sheet"><div class="stamps">{stamps}</div>
<div class="view"><div class="view__meta"><span class="view__no">No. {esc(f0["no"])}</span><span class="view__when">{esc(f0.get("when", ""))}</span></div>
<h3>{esc(f0["title"])}</h3><div class="view__media"><img src="{f0["img"]}" alt="{esc(f0["title"])}"></div>
<span class="label">{s.get("caption_label", "THE CAPTION")}</span><p class="view__cap">{esc(f0.get("text", ""))}</p>{link}
<div class="view__ctrl"><button type="button" class="view__prev" aria-label="Previous">← prev</button><button type="button" class="view__next" aria-label="Next">next →</button><span class="view__count">1 / {len(items)}</span></div>
</div></div><script type="application/json">{data}</script></section>'''


def sec_figure(s, root):
    paras = ''.join(f'<p class="copy">{p}</p>' for p in s.get('paras', []))
    quote = f'<p class="quote" style="margin-top:18px">{s["quote"]}</p>' if s.get('quote') else ''
    return f'<section class="figure"><div><img src="{asset(root, s["img"])}" alt="{esc(s["alt"])}" loading="lazy"></div><div>{kick_title(s)}{paras}{quote}{links(s, root)}</div></section>'


def sec_palette(s, root):
    sw = ''.join(f'<div><i class="perf-s" style="--c:{c["hex"]}"></i><strong>{c["n"]}</strong><span>{c["hex"]} · {c["use"]}</span></div>' for c in s['swatches'])
    pairs = ''.join(f'<div><span>{a}</span><b>→</b><em>{b}</em></div>' for a, b in s.get('pairs', []))
    note = f'<p class="copy" style="margin-top:14px;font-size:15px;color:var(--cocoa)">{s["note"]}</p>' if s.get('note') else ''
    return f'<section>{kick_title(s)}<div class="split"><div class="swatches">{sw}</div><div class="pairs">{pairs}{note}</div></div></section>'


def sec_numbers(s, root):
    n = ''.join(f'<div><strong>{x["n"]}</strong><span>{x["l"]}</span></div>' for x in s['items'])
    note = f'<p class="copy" style="margin-top:18px">{s["note"]}</p>' if s.get('note') else ''
    return f'<section>{kick_title(s)}<div class="numbers">{n}</div>{note}</section>'


def sec_route(s, root):
    you = ' class="you"'
    items = ''.join(f'<li{you if x.get("you") else ""}><strong>{x["t"]}</strong><span>{x["d"]}</span></li>' for x in s['items'])
    intro = f'<p class="copy" style="margin-bottom:26px">{s["intro"]}</p>' if s.get('intro') else ''
    key = f'<p class="route-key"><i></i>{s["key"]}</p>' if s.get('key') else ''
    return f'<section>{kick_title(s)}{intro}<ol class="route">{items}</ol>{key}</section>'


def sec_text(s, root):
    lead = f'<p class="lead" style="margin-bottom:18px">{s["lead"]}</p>' if s.get('lead') else ''
    paras = ''.join(f'<p class="copy">{p}</p>' for p in s.get('paras', []))
    return f'<section>{kick_title(s)}{lead}{paras}{links(s, root)}</section>'


def sec_quote(s, root):
    return f'<section><p class="quote">{s["text"]}</p></section>'


def sec_band(s, root):
    return f'<section class="band"><span class="kick" style="margin:0">{s["kick"]}</span><p>{s["text"]}</p></section>'


SECTIONS = {k[4:]: v for k, v in globals().items() if k.startswith('sec_')}


def build_case(c):
    slug, root = c['slug'], '../../'
    art = c['hero']
    if art.get('svg'):
        pic = art['svg']
    else:
        pic = f'<img src="{asset(root, art["img"])}" alt="{esc(art["alt"])}">'
    hero_art = (f'<div class="hero__art"><div class="hero__stamp perf{" hero__stamp--wide" if art.get("wide") else ""}">{pic}</div>'
                f'{postmark(c["postmark"], c["year"])}</div>')
    facts = ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in c['facts'])
    body = ''.join(SECTIONS[s['type']](s, root) for s in c['sections'])
    nxt = c['next']
    out = (head(c['title'] + ' · Riya Dutta', c['description'], root, f'work/{slug}/') + top(root, '../') + track(c['no']) +
           f'''<main class="wrap">
<nav class="crumb" aria-label="Breadcrumb"><a class="ul" href="../">Work</a> <span aria-hidden="true">/</span> No. {c["no"]}<b>· {c["credit"]}</b></nav>
<section class="hero"><div class="hero__text"><span class="tag torn">{c["tag"]}</span><h1>{c["title"]}</h1><p class="hero__sub">{c["sub"]}</p><dl class="facts">{facts}</dl></div>{hero_art}</section>
<div class="body">{body}</div>
<nav class="next" aria-label="More work"><a href="../"><span>← ALL WORK</span><strong class="ul">Work</strong></a><a href="{nxt["href"]}"><span>NEXT →</span><strong class="ul">{nxt["title"]}</strong></a></nav>
</main>
''' + foot(root))
    d = ROOT / 'work' / slug
    d.mkdir(parents=True, exist_ok=True)
    (d / 'index.html').write_text(out)
    print('wrote', d.relative_to(ROOT) / 'index.html')


def build_index(w):
    root = '../'
    tags = [('all', 'All')] + [(t.lower(), t) for t in w['filters']]
    count = lambda t: len(w['items']) if t == 'all' else sum(t in [x.lower() for x in i['tags']] for i in w['items'])
    filt = ''.join(f'<button type="button" data-tag="{t}" aria-pressed="{"true" if t == "all" else "false"}">{n}<b>{count(t)}</b></button>' for t, n in tags)
    cards = ''
    for it in w['items']:
        pic = it['svg'] if it.get('svg') else f'<img src="{asset(root, it["img"])}" alt="" loading="lazy">'
        tg = ''.join(f'<span>{t}</span>' for t in it['tags'])
        cards += (f'<a class="pcard" href="{it["href"]}" data-tags="{" ".join(t.lower() for t in it["tags"])}" style="--c: var(--{it.get("color", "sage")})">'
                  f'<div class="pcard__img">{pic}<span class="pcard__no perf-s"><span>No. {it["no"]}</span></span></div>'
                  f'<div class="pcard__body"><span class="pcard__kind">{it["kind"]}</span><strong>{it["title"]}</strong><p>{it["blurb"]}</p><div class="pcard__tags">{tg}</div></div></a>')
    out = (head('Work · Riya Dutta', w['description'], root, 'work/') + top(root, './') +
           f'''<main class="wrap">
<section class="wi-head"><h1 class="torn">Work</h1><p>{w["intro"]}</p></section>
<div class="filters" role="group" aria-label="Filter the work">{filt}</div>
<div class="postcards">{cards}</div>
</main>
''' + foot(root))
    (ROOT / 'work' / 'index.html').write_text(out)
    print('wrote work/index.html')


if __name__ == '__main__':
    for f in sorted((ROOT / 'content' / 'cases').glob('*.json')):
        build_case(json.loads(f.read_text()))
    build_index(json.loads((ROOT / 'content' / 'work.json').read_text()))
