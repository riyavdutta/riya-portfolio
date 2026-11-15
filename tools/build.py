#!/usr/bin/env python3
"""Build the case study pages and the work index from content/.

    python3 tools/build.py

content/cases/<slug>.json  ->  work/<slug>/index.html   (assets/cs.css + cs.js)
content/work.json          ->  work/index.html

Strings in the content files are trusted HTML (they're written for this site); post captions are escaped.
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE_URL = 'https://riya-folio.vercel.app/'
LINKEDIN = 'https://www.linkedin.com/in/riyaa-duttaa'
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&amp;family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&amp;family=Space+Mono:wght@400;700&amp;family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&amp;display=swap" rel="stylesheet">')
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
<link rel="stylesheet" href="{root}assets/tokens.css">
<link rel="stylesheet" href="{root}assets/case.css">
</head>
<body>
'''


def top(root, work_href, current_work=True):
    cur = ' aria-current="page"' if current_work else ''
    return f'''<div class="top"><div class="wrap">
<a class="top__name" href="{root}">Riya Dutta</a>
<nav aria-label="Main"><a href="{work_href}"{cur}>Work</a><a class="ul" href="{root}#about">About</a><a class="ul" href="{root}#contact">Contact</a><a class="ul" href="{LINKEDIN}" rel="me">LinkedIn</a></nav>
</div></div>
'''


def foot(root):
    return (f'<footer class="foot"><div class="wrap"><span>Riya Dutta · 2026</span>'
            f'<span><a class="ul" href="{root}#contact">Contact</a> · <a class="ul" href="{LINKEDIN}" rel="me">LinkedIn</a></span></div></footer>\n'
            f'<script src="{root}assets/case.js"></script>\n<script src="{root}assets/motion.js"></script>\n</body>\n</html>\n')


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


def sec_studiorun(s, root):
    # the interactive run (assets/studio-run.js); the plain list of stops stays as the no-script fallback
    you = ' class="you"'
    items = ''.join(f'<li{you if x.get("you") else ""}><strong>{x["t"]}</strong><span>{x["d"]}</span></li>' for x in s['items'])
    intro = f'<p class="copy" style="margin-bottom:26px">{s["intro"]}</p>' if s.get('intro') else ''
    data = json.dumps({k: s[k] for k in ('items', 'rules', 'post')}, ensure_ascii=False).replace('</', '<\\/')
    return (f'<section>{kick_title(s)}{intro}<ol class="route srun-static">{items}</ol>'
            f'<div class="srun" data-root="{root}" hidden><ol class="srun-stops" aria-label="The eleven stops"></ol><div class="srun-stage" aria-live="polite"></div></div>'
            f'<script type="application/json" class="srun-data">{data}</script><script src="{root}assets/studio-run.js" defer></script></section>')


def sec_text(s, root):
    lead = f'<p class="lead" style="margin-bottom:18px">{s["lead"]}</p>' if s.get('lead') else ''
    paras = ''.join(f'<p class="copy">{p}</p>' for p in s.get('paras', []))
    return f'<section>{kick_title(s)}{lead}{paras}{links(s, root)}</section>'


def sec_quote(s, root):
    return f'<section><p class="quote">{s["text"]}</p></section>'


def sec_band(s, root):
    return f'<section class="band"><span class="kick" style="margin:0">{s["kick"]}</span><p>{s["text"]}</p></section>'


SECTIONS = {k[4:]: v for k, v in globals().items() if k.startswith('sec_')}


# ---------------------------------------------------------------- case pages (cs.css + cs.js)

CS_FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&amp;family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&amp;display=swap" rel="stylesheet">')
CS_VER = '2'
strip_tags = lambda x: re.sub(r'<[^>]+>', '', x)


def cs_head(title, desc, root, path):
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
<meta name="theme-color" content="#f4efe6">
<link rel="canonical" href="{SITE_URL}{path}">
<link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
{CS_FONTS}
<link rel="stylesheet" href="{root}assets/cs.css?v={CS_VER}">
</head>
<body>
'''


class Case:
    """Renders one case's sections; keeps a counter for section ids and the sheet's posts for the chapters."""

    def __init__(self, c, root):
        self.c, self.root, self.n, self.posts = c, root, 0, []
        sheet = next((x for x in c['sections'] if x['type'] == 'sheet'), None)
        if sheet:
            for it in sheet['items']:
                d = {k: it[k] for k in ('no', 'title', 'fmt', 'when', 'text', 'link') if it.get(k)}
                d['img'] = asset(root, it['img'])
                if it.get('video'): d['video'] = asset(root, it['video'])
                if it.get('slides'): d['slides'] = [asset(root, x) for x in it['slides']]
                self.posts.append(d)

    def open(self, s, cls):
        self.n += 1
        lab = f' data-label="{esc(strip_tags(s["kick"]).capitalize())}"' if s.get('kick') else ''
        return f'<section class="s {cls}" id="s-{self.n}"{lab}>'

    @staticmethod
    def head(s):
        out = f'<p class="lab">{s["kick"]}</p>' if s.get('kick') else ''
        return out + (f'<h2>{s["title"]}</h2>' if s.get('title') else '')

    def links(self, s):
        if not s.get('links'): return ''
        ext = ' target="_blank" rel="noopener"'
        return '<div class="links">' + ''.join(f'<a class="btn{" line" if i else ""}" href="{asset(self.root, l["href"])}"{ext if l["href"].startswith("http") else ""}>{l["label"]}</a>' for i, l in enumerate(s['links'])) + '</div>'

    # each section type
    def cards(self, s):
        cs = ''.join(f'<div class="card{" dark" if i % 2 else ""}"><p class="lab">{x["k"]}</p><p>{x["t"]}</p></div>' for i, x in enumerate(s['items']))
        return self.open(s, 'cards2') + f'<div class="wrap">{self.head(s)}<div class="duo">{cs}</div></div></section>'

    def statement(self, s):
        lead = f'<p class="big fill">{s["lead"]}</p>' if s.get('lead') else ''
        paras = '<div class="paras">' + ''.join(f'<p>{p}</p>' for p in s['paras']) + '</div>' if s.get('paras') else ''
        tiles = ''
        if s.get('tiles'):
            tiles = '<div class="tiles">' + ''.join(f'<button type="button" class="tile{" on" if i == 0 else ""}" aria-expanded="{"true" if i == 0 else "false"}"><b>{i + 1:02d}</b><strong>{t["t"]}</strong><span>{t["d"]}</span></button>' for i, t in enumerate(s['tiles'])) + '</div>'
        close = f'<p class="close after">{s["close"]}</p>' if s.get('close') else ''
        return self.open(s, 'idea') + f'<div class="wrap">{self.head(s)}{lead}{paras}{tiles}{close}{self.links(s)}</div></section>'

    def chapters(self, s):
        days = lambda t: [int(x) for x in re.findall(r'\b(\d{1,2})\b', t)]
        panels = ''
        for i, x in enumerate(s['items']):
            d = days(x['when']); lo, hi = (min(d), max(d)) if d else (0, -1)
            mine = [k for k, p in enumerate(self.posts) if days(p.get('when', ''))[:1] and lo <= days(p['when'])[0] <= hi]
            thumbs = ''.join(f'<button type="button" data-open="{k}" aria-label="Open {esc(self.posts[k]["title"])}"><img src="{self.posts[k]["img"]}" alt="" loading="lazy"></button>' for k in mine)
            col = x.get('c', '#800020')
            fg = '#2a1a1e' if light(col) else '#f4efe6'
            panels += (f'<div class="panel" style="background:{col};color:{fg}"><div><small>{x["when"]}</small><b>{x["t"]}</b><p>{x["d"]}</p></div>'
                       f'<div class="posts">{thumbs}</div><span class="n" aria-hidden="true">{i + 1:02d}</span></div>')
        intro = f'<p class="sub">{s["intro"]}</p>' if s.get('intro') else ''
        dots = ''.join('<i></i>' for _ in s['items'])
        return self.open(s, 'chap') + f'<div class="stick"><div class="wrap head">{self.head(s)}{intro}</div><div class="track">{panels}</div><div class="dots" aria-hidden="true">{dots}</div></div></section>'

    def sheet(self, s):
        ar = s.get('aspect', '4 / 5').replace(' ', '')
        w, h = (float(v) for v in ar.split('/'))
        wide = w / h > 1.2
        pw = 'min(420px,46vh,72vw)' if wide else 'min(240px,26vh,56vw)'
        cards, prev = '', None
        for i, p in enumerate(self.posts):
            m = re.match(r'^(\w{3} \d{1,2} \w{3}) · ', p.get('when', ''))
            if m and m.group(1) != prev:
                cards += f'<span class="day" aria-hidden="true">{m.group(1).upper()}</span>'
                prev = m.group(1)
            fmt = f'<span class="fmt">{esc(p["fmt"].upper())}</span>' if p.get('fmt') else ''
            cards += (f'<button class="post" type="button" data-open="{i}"><span class="pic"><img src="{p["img"]}" alt="" loading="lazy">{fmt}<span class="open" aria-hidden="true">Open ↗</span></span>'
                      f'<span class="t">{esc(p["title"])}</span><span class="when">{esc(p.get("when", ""))}</span></button>')
        intro = f'<p class="sub">{s["intro"]}</p>' if s.get('intro') else ''
        self.cap_label = s.get('caption_label', 'THE CAPTION')
        # scroll-driven: the page holds while scrolling carries the posts past the centre, one at a time
        n = len(self.posts)
        return (self.open(s, 'week') + f'<div class="pinw" id="pinw" style="--n:{n}"><div class="stick"><div class="wrap head">{self.head(s)}{intro}</div>'
                f'<div class="strip" id="strip" style="--ar:{ar};--pw:{pw}"><div class="belt">{cards}</div></div>'
                f'<div class="wrap now" aria-live="polite"><span class="cnt" id="ncnt">01 / {n:02d}</span><div class="ntext"><small id="nwhen"></small><b id="ntitle"></b><p id="nline"></p></div>'
                f'<span class="bar2" aria-hidden="true"><i></i></span></div></div></div></section>')

    def palette(self, s):
        sw = ''.join(f'<button type="button" data-hex="{x["hex"]}" style="background:{x["hex"]};color:{"#2a1a1e" if light(x["hex"]) else "#f4efe6"}"><small>{x["hex"]} · {x["use"]}</small><b>{x["n"]}</b></button>' for x in s['swatches'])
        pairs = ''.join(f'<button class="pair" type="button" aria-pressed="false"><span class="fi"><span class="fa"><small>THE OBJECT</small><b>{a}</b></span><span class="fb"><small>WHAT IT MEANS</small><b>{b}</b></span></span></button>' for a, b in s.get('pairs', []))
        note = f'<p class="note">{s["note"]}</p>' if s.get('note') else ''
        np = min(len(s.get('pairs', [])) or 1, 5)
        return (self.open(s, 'look') + f'<div class="wrap">{self.head(s)}<div class="sw" style="--n:{min(len(s["swatches"]), 6)}">{sw}</div>'
                + (f'<div class="pairs" style="--n:{np}">{pairs}</div>' if pairs else '') + f'{note}</div></section>')

    def numbers(self, s):
        ns = ''.join(f'<div class="num"><strong>{x["n"]}</strong><span>{x["l"]}</span></div>' for x in s['items'])
        note = f'<p class="note">{s["note"]}</p>' if s.get('note') else ''
        return self.open(s, 'numbers') + f'<div class="wrap">{self.head(s)}<div class="nums">{ns}</div>{note}</div></section>'

    def rules(self, s):
        on = ' class="on"'
        items = ''.join(f'<li{on if i == 0 else ""}><button type="button" aria-expanded="{"true" if i == 0 else "false"}"><b>{i + 1:02d}</b><strong>{r["t"]}</strong><i aria-hidden="true">+</i></button>'
                        f'<div class="rd"><div><p>{r["d"]}</p></div></div></li>' for i, r in enumerate(s['items']))
        intro = f'<p class="sub">{s["intro"]}</p>' if s.get('intro') else ''
        return self.open(s, 'rulesec') + f'<div class="wrap split"><div>{self.head(s)}{intro}</div><ol class="rules">{items}</ol></div></section>'

    def text(self, s):
        lead = f'<p class="lead">{s["lead"]}</p>' if s.get('lead') else ''
        paras = ''.join(f'<p>{p}</p>' for p in s.get('paras', []))
        return self.open(s, 'text') + f'<div class="wrap split"><div>{self.head(s)}</div><div class="paras">{lead}{paras}{self.links(s)}</div></div></section>'

    def quote(self, s):
        return self.open(s, 'quotesec') + f'<div class="wrap"><p class="quote fill">{s["text"]}</p></div></section>'

    def figure(self, s):
        paras = ''.join(f'<p>{p}</p>' for p in s.get('paras', []))
        quote = f'<p class="quote" style="font-size:28px;margin-top:10px">{s["quote"]}</p>' if s.get('quote') else ''
        img = asset(self.root, s['img'])
        return (self.open(s, 'figsec') + f'<div class="wrap fig"><button type="button" class="pic" data-zoom="{img}" data-alt="{esc(s["alt"])}" data-title="{esc(strip_tags(s.get("title", "")))}" data-kick="{esc(strip_tags(s.get("kick", "")))}" aria-label="Enlarge: {esc(s["alt"])}">'
                f'<img src="{img}" alt="{esc(s["alt"])}" loading="lazy"></button><div>{self.head(s)}<div class="paras">{paras}</div>{quote}{self.links(s)}</div></div></section>')

    def route(self, s):
        items = ''.join(f'<li><strong>{x["t"]}</strong><span>{x["d"]}</span></li>' for x in s['items'])
        intro = f'<p class="sub">{s["intro"]}</p>' if s.get('intro') else ''
        return self.open(s, 'routesec') + f'<div class="wrap">{self.head(s)}{intro}<ol class="route">{items}</ol></div></section>'

    def studiorun(self, s):
        # the interactive run (assets/studio-run.js); the plain list of stops stays as the no-script fallback
        you = ' class="you"'
        items = ''.join(f'<li{you if x.get("you") else ""}><strong>{x["t"]}</strong><span>{x["d"]}</span></li>' for x in s['items'])
        intro = f'<p class="sub" style="margin-bottom:26px">{s["intro"]}</p>' if s.get('intro') else ''
        data = json.dumps({k: s[k] for k in ('items', 'rules', 'post')}, ensure_ascii=False).replace('</', '<\\/')
        return (self.open(s, 'runsec') + f'<div class="wrap">{self.head(s)}{intro}<ol class="route srun-static">{items}</ol>'
                f'<div class="srun" data-root="{self.root}" hidden><ol class="srun-stops" aria-label="The eleven stops"></ol><div class="srun-stage" aria-live="polite"></div></div>'
                f'<script type="application/json" class="srun-data">{data}</script><script src="{self.root}assets/studio-run.js" defer></script></div></section>')

    def bands(self, group):
        cards = ''
        for i, b in enumerate(group):
            text = re.sub(r'“([^”]{6,})”', lambda m: f'<span class="typed" data-t="“{esc(m.group(1))}”">“{m.group(1)}”</span>', b['text'], count=1)
            cards += f'<div class="card{" dark" if (i % 2 or len(group) == 1) else ""}"><p class="lab">{b["kick"]}</p><p>{text}</p></div>'
        style = '' if len(group) > 1 else ' style="grid-template-columns:1fr"'
        return self.open(group[0], 'bandsec') + f'<div class="wrap"><div class="duo"{style}>{cards}</div></div></section>'

    def body(self):
        out, secs, i = '', self.c['sections'], 0
        while i < len(secs):
            if secs[i]['type'] == 'band':
                j = i
                while j < len(secs) and secs[j]['type'] == 'band': j += 1
                out += self.bands(secs[i:j]); i = j
            else:
                out += getattr(self, secs[i]['type'])(secs[i]); i += 1
        return out


def light(hex_):
    n = int(hex_.lstrip('#'), 16)
    return 0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255) > 150


def build_case(c):
    slug, root = c['slug'], '../../'
    k = Case(c, root)
    art = c['hero']
    pic = art['svg'] if art.get('svg') else f'<img src="{asset(root, art["img"])}" alt="{esc(art["alt"])}">'
    short = [(a, b) for a, b in c['facts'] if len(strip_tags(b)) <= 48]
    long_ = [(a, b) for a, b in c['facts'] if len(strip_tags(b)) > 48]
    pills = ''.join(f'<span class="fact"><small>{a}</small>{b}</span>' for a, b in short)
    if long_:
        pills += f'<button class="fact more" id="more" type="button" aria-expanded="false" aria-controls="morefacts"><small>MORE</small>{" · ".join(a.capitalize() for a, _ in long_)} <span class="ar">↓</span></button>'
    more = '<dl class="morefacts" id="morefacts">' + ''.join(f'<dt>{a}</dt><dd>{b}</dd>' for a, b in long_) + '</dl>' if long_ else ''
    body = k.body()
    posts = json.dumps(k.posts, ensure_ascii=False).replace('</', '<\\/')
    cap = getattr(k, 'cap_label', 'THE CAPTION')
    nxt = c['next']
    view = (f'<div class="view" id="view" role="dialog" aria-modal="true" aria-label="Post"><button class="x" id="vx" type="button">Close ✕</button><div class="in"><div class="media" id="vm"></div>'
            f'<div class="side"><small id="vw"></small><h3 id="vt"></h3><p class="lab">{cap}</p><div class="cap" id="vc"></div><a class="btn line vlink" id="vl" href="#" target="_blank" rel="noopener" hidden>Open the live page ↗</a>'
            f'<div class="nav"><button type="button" id="vp">← Prev</button><button type="button" id="vn">Next →</button><span id="vi"></span></div></div></div></div>')
    out = (cs_head(c['title'] + ' · Riya Dutta', c['description'], root, f'work/{slug}/') +
           f'''<header class="bar"><div class="wrap"><a class="me" href="{root}"><i aria-hidden="true"></i>Riya Dutta</a><a class="back" href="../">← All work</a><a class="hi" href="{root}#contact">Say hello</a></div><i class="prog" aria-hidden="true"></i></header>
<nav aria-label="On this page"><ol class="rail" id="rail"></ol></nav>
<main>
<section class="hero" id="top" data-label="Cover"><div class="wrap grid">
<div><p class="lab">{c["tag"]} · No. {c["no"]} · {c["credit"].capitalize()}</p><h1 class="kin" id="kin">{c["title"]}</h1><p class="lede">{c["sub"]}</p>
<div class="facts">{pills}</div>{more}{k.links(c)}</div>
<div class="cover{" wide" if art.get("wide") else ""}" id="cover" style="view-transition-name: case-{slug}">{pic}<span class="stamp" aria-hidden="true">{c["no"]}</span></div>
</div></section>
{body}
<a class="next" href="{nxt["href"]}"><div class="wrap"><small>NEXT CASE</small><b>{nxt["title"]}</b></div><span class="arr" aria-hidden="true">→</span></a>
</main>
<footer class="foot"><div class="wrap"><span>© 2026 Riya Dutta</span><span><a href="../">All work</a> · <a href="{root}#contact">Say hello</a> · <a href="{LINKEDIN}" rel="me">LinkedIn</a></span></div></footer>
{view}
<script type="application/json" id="posts">{posts}</script>
<script src="{root}assets/cs.js?v={CS_VER}"></script>
</body>
</html>
''')
    d = ROOT / 'work' / slug
    d.mkdir(parents=True, exist_ok=True)
    (d / 'index.html').write_text(out)
    print('wrote', d.relative_to(ROOT) / 'index.html')


def build_index(w):
    root = '../'
    count = lambda t: len(w['items']) if t == 'all' else sum(t in [x.lower() for x in i['tags']] for i in w['items'])
    tags = [('all', 'All')] + [(t.lower(), t) for t in w['filters'] if count(t.lower())]
    filt = ''.join(f'<button type="button" data-tag="{t}" aria-pressed="{"true" if t == "all" else "false"}">{n}<b>{count(t)}</b></button>' for t, n in tags)
    cards = ''
    for it in w['items']:
        pic = it['svg'] if it.get('svg') else f'<img src="{asset(root, it["img"])}" alt="" loading="lazy">'
        tg = ''.join(f'<span>{t}</span>' for t in it['tags'])
        cards += (f'<a class="pcard" href="{it["href"]}" data-tags="{" ".join(t.lower() for t in it["tags"])}" style="--c: var(--{it.get("color", "sage")})">'
                  f'<div class="pcard__img" style="view-transition-name: case-{it["href"].strip("/")}">{pic}<span class="pcard__no perf-s"><span>No. {it["no"]}</span></span></div>'
                  f'<div class="pcard__body"><span class="pcard__kind">{it["kind"]}</span><strong>{it["title"]}</strong><p>{it["blurb"]}</p><div class="pcard__tags">{tg}</div></div></a>')
    cards = cards or '<p class="copy">Nothing here yet.</p>'
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
    work = json.loads((ROOT / 'content' / 'work.json').read_text())
    build_index(work)
