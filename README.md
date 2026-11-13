# Riya Dutta · Portfolio

The source of [riyavdutta.github.io/riya-portfolio](https://riyavdutta.github.io/riya-portfolio/).

## What's here

| Path | What it is |
|---|---|
| `index.html` | Home page: the choice game, the Work index, the path, the About board and the desktop contact |
| `assets/home.css`, `assets/home.js` | The home page's styles and interactions (one responsive layout). When you change either, raise the `?v=` number where index.html links them so visitors get the new file |
| `work/` | The Work page and one folder per case study |
| `content/` | The words and image lists behind the Work page and case studies |
| `tools/build.py` | Turns `content/` into the pages in `work/` |
| `404.html` | "Return to sender": shown for any missing page |
| `assets/tokens.css` | The design system: colour roles, label sizes, shadows, motion. Change a value here and it changes everywhere |
| `assets/site.js` | Runs the interactive parts of The Haunted CRM page and the 404 page |
| `assets/case.css`, `assets/case.js` | Styles and interactions for the case studies and the Work page |
| `assets/img/`, `assets/video/` | Images and videos |
| `docs/brief.md` | The decisions behind the site |
| `docs/ideas.md` | Ideas for new interactive pieces |

## Add or change a case study

1. Put its images in `assets/img/` (and any videos in `assets/video/`).
2. Copy one of the files in `content/cases/` and change the words. Each page is a list of sections (`cards`, `statement`, `chapters`, `sheet`, `rules`, `numbers`, `route`, `palette`, `text`, `quote`, `band`); look at the existing files for examples.
3. Add it to `content/work.json` so it appears on the Work page, with its tags (Marketing, Design, Build, Research). To show it on the home page too, add it to the list in `index.html` (`#kList`) and to `P` at the top of `assets/home.js`.
4. Run `python3 tools/build.py`.

The Haunted CRM page (`work/the-haunted-crm/`) was built separately and isn't generated from `content/`.

### Case study extras

- **Live and code links:** add `"links": [{"href": "...", "label": "Live site ↗"}, {"href": "...", "label": "View the code ↗"}]` to a case study file and the buttons appear under its facts.
- **Tags:** Marketing, Brand, Product, Design, Build, Research and Lab. A filter shows on the Work page only once something uses it.
- **New projects** start from the `riya-lab-starter` folder next to this one; its README covers Vercel.

## Preview locally

From the folder that contains `riya-portfolio`, run:

```bash
python3 -m http.server 4180
```

Then open <http://localhost:4180/riya-portfolio/>.

## Publishing

GitHub Pages publishes the `main` branch. Every push updates the live site within a minute or two.
