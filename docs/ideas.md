# Ideas: fun, interactive and on-theme

Ideas for making the site more playful without losing the calm postcard feel. Each one is grouped by theme, with a rough size: S is an afternoon, M a day or two, L needs a service or a lot of art.

## Done
- **Sticker sheet** (every page): peel stickers off a sheet and stick them anywhere; they stay put in your browser. `assets/stickers.js`
- **Case studies** for all six pieces, plus a **Work** page with filters (Marketing, Design, Build, Research). Built from `content/` by `tools/build.py`.
- Earlier: postmark-your-visit postcard, draggable desk stamps, stamp book, flip cards, record crate, post sheets with playable videos and swipeable carousels, tracking bar on case studies, "Return to sender" 404.

## Post office
1. **Write and post a postcard (M).** The contact card becomes a real postcard: write a note, pick one of the stickers as the stamp, drop it into a letterbox (a short animation), and it opens your email with the message.
2. **A passport across the site (S).** The stamp book follows visitors to case studies: finishing a case study (the tracking bar reaches "Delivered") stamps the passport.
3. **Postcard rack for the Work page (M).** A spinning wire rack of postcards; drag to turn it, pick a card to open the case study.
4. **Airmail page transitions (S).** Between pages, the screen folds like an envelope (View Transitions API, with a plain fallback).
5. **Wax seal on the email link (S).** Hover cracks the seal; click opens the email.

## Stickers
6. **Hidden stickers (S).** A sticker tucked into each case study (a ghost on The Haunted CRM, an amber lamp on The Founder Bottleneck). Finding one adds it to your sheet.
7. **A sticker of the month (S).** Like the seasonal stamp: one new sticker appears each month.
8. **Stickers that react (S).** The "say yes!" bubble shows the tagline when you stick it down; the ghost says "boo" when you peel it.

## Scrapbook
9. **Washi tape and pinned prints (S).** Photos and screenshots held on with tape, swinging slightly on hover.
10. **Rubber-stamp cursor (S).** In the hero, a small stamp cursor that leaves a few postmarks wherever you click.

## Marketer and researcher
11. **Which hook would you click? (M).** A tiny game using real hooks from the campaigns: pick one of two, then see why each was written that way. Shows how you think about attention and decisions.
12. **Where did you look first? (M).** A post with a heatmap that builds from the cursor, a nod to the eye-tracking work at ISLab. Runs only in the visitor's browser.

## More pages
13. **Lab (M).** A page for personal projects, games and experiments, so the main work stays focused. Projects from the other chat can live here first.
14. **Now (S).** A single postcard, updated monthly, saying what you're working on and reading.
15. **Record player for Records (M).** Drop a record on the turntable to "play" its story.

## Recommended next
Start with 1 (the postcard contact), 6 (hidden stickers) and 11 (the hook game): each is fun, on-theme, and shows marketing thinking, not just decoration.

## Guardrails
- Every effect has a reduced-motion version and works with a keyboard.
- Nothing about visitors leaves their browser.
- One motif per section; the page should still feel calm.
