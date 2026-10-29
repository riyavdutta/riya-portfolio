# Project brief

The decisions behind this portfolio, written down so new work fits what's already there.

## 1. Purpose

A professional portfolio with a touch of personal branding. It should show what Riya does and how she thinks, and give a recruiter or client a clear reason to get in touch. It's personal in design, not in content.

## 2. Positioning and audience

- **Who:** Riya Dutta, Marketing Consultant at B2Ne (Business To Nexus), working with Nodinite, and a consumer behaviour researcher.
- **What she does:** B2B tech marketing, brand and LinkedIn campaigns, and research on how people decide: what they notice, what they trust and what makes them act.
- **Audience:** recruiters and hiring managers in marketing, brand and product roles; B2B tech founders; research collaborators.
- **Voice:** honest and specific. No invented copy, credentials, statistics or results. Facts are stated quietly and on her terms.

## 3. Content

- **Home:** postcard hero, About with three proof points, Selected work (five folders), What's in my kit, Back catalogue (records), Contact.
- **Selected work, in order:** The Haunted CRM, The Founder Bottleneck, The Content Studio, the B2Ne website, CRM Graveyard. TRACE-BRL has its own case study, linked from About and listed on the Work page.
- **Case studies:** brief, audience, idea, rules, the work itself, lead asset, look, how it was made. Results appear only once they've been measured. Each one is generated from a file in `content/cases/`.
- **Work page:** every piece, filterable by Marketing, Design, Build and Research, so new projects slot in by tag.
- **Credits:** B2Ne campaigns are "Made for B2Ne", and Riya ran them end to end: concept, copy, design, video, posting and analysis. The B2Ne website is "Co-built with B2Ne’s founder" (the founder isn’t named on the site); Riya made the About, How We Help, Services, Pricing and Nexus Academy pages; the site's seven menu pages are shown on her portfolio. B2Ne has approved showing this work.
- **Never on the site:** salary or HR details, internal client data (such as Nodinite's), or claims she hasn't confirmed.

## 4–5. Visual direction

- **Look:** nostalgic postcard and stamp feel, in Riya's own palette: cherry, truffle, vanilla, ivory, blush, blossom, sage and slate (see the `:root` tokens in the page CSS).
- **Type:** three fonts only, used consistently: Playfair Display (display), Work Sans (reading text), Space Mono (labels).
- **Interactions:** a postcard visitors can postmark (remembered in their own browser), draggable stamps, a stamp book that fills as sections are seen, flip cards, a record crate, a stamp sheet on case studies, and a sticker sheet on every page. Everything respects reduced-motion settings. More ideas are in `docs/ideas.md`.
- **Calm, not cluttered:** each motif appears once and colour stays restrained.

## 6. Technical setup

- **A plain static site:** HTML, CSS and a small amount of JavaScript. No framework and no build step.
- **Layouts:** each page carries a desktop layout and a phone layout. `assets/site.js` picks the phone layout below 760px and runs the page's interactive logic.
- **Hosting:** GitHub Pages from the `main` branch. A custom domain can be added later.
- **Privacy:** nothing about visitors is sent anywhere. The postcard is remembered only in the visitor's own browser.
