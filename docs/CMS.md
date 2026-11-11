# Content management (Decap CMS)

Editors use a web form at `/admin/`. Every save becomes a commit to `main`, and GitHub Actions rebuilds
the site in about a minute. Nothing runs on a server.

## What editors can do
- **Pages**: create a page from blocks (text, cards, callout, image and text, FAQ, contact list, meeting
  details, link pills, quote, buttons, checklist, upcoming events). Drag blocks by the grip to reorder them.
  The page appears at `/<file-name>/`, gets a breadcrumb, structured data and a sitemap entry automatically.
  FAQ blocks also become `FAQPage` markup.
- **Events**: each event gets `/events/<name>/` with `Event` markup, plus Spanish and French pages once translated (see `docs/TRANSLATION.md`). Past events leave the lists and the
  sitemap, and their pages say "This event has passed".
- **Committees**: one file per committee in `src/content/committees/`. It drives the committee page, the picture
  tiles and "also" list on the home and Committees pages, and the Contact page directory (conference and standing
  lists, plus the structured data). Adding a committee in the CMS adds all of those. Files are validated at build
  time (valid email, required fields for committees with a page), so a bad edit fails the build instead of going live.
  Spanish and French committee text still lives in `src/i18n/pages/committees.ts` and `src/i18n/committees.ts`;
  a new committee shows its English text in those languages until someone adds translations there. Picture tiles
  use the six bundled photos; a new tile picture needs a developer.
- **Districts**: one file per district in `src/content/districts/`. The `lines` keep the standard wording so the
  Spanish and French translator (`src/i18n/districts.ts`) still matches them.
- **Contact details and officers**: `src/content/site/contact.yml` (general and Registrar email, mailing address,
  officer emails) feeds the footer, Contact page and Registrar page.
- **Main menu**: Site settings > Main menu. Drag to reorder; use `/page-name/` for pages on this site.

## Local use (no setup beyond npm install)
```
npm run cms    # terminal 1: local file proxy for the CMS
npm run dev    # terminal 2: the site
```
Open http://localhost:4321/admin/ and click Login. Changes are written to `src/content/`.

## Letting editors sign in on the deployed site
Decap signs in with GitHub, which needs a small OAuth proxy because GitHub Pages is static. A ready-made
Cloudflare Worker is in `oauth-worker/` (free tier is plenty).
1. Create a GitHub OAuth App: github.com > Settings > Developer settings > OAuth Apps > New.
   Homepage URL: `https://robrichardsdpt.github.io/aaemass-astro/`. Callback URL: fill in after step 3.
2. `cd oauth-worker && npx wrangler login` (opens a browser to sign in to Cloudflare).
3. `npx wrangler deploy`. It prints the worker URL, for example `https://area30-decap-oauth.<you>.workers.dev`.
   Set the OAuth App's callback URL to `<worker URL>/callback`.
4. `npx wrangler secret put GITHUB_CLIENT_ID` and `npx wrangler secret put GITHUB_CLIENT_SECRET`
   (paste the values from the OAuth App when prompted).
5. In `public/admin/config.yml`, set `base_url` to the worker URL (uncomment the line), commit and push.
6. Editors need a GitHub account with write access to this repository. Sign in at `/admin/`.

## Who can change the site, and the review step
- **Collaborators:** only people added under repo Settings > Collaborators with the Write role can save anything.
- **Review step:** the CMS runs in editorial workflow. An editor's save creates a draft (a pull request on a `cms/...`
  branch). In the CMS, the **Workflow** tab moves it Draft > In review > Ready, and **Publish** merges it.
- **Branch protection:** `main` requires a pull request with 1 approval. Editors cannot publish their own work:
  the repo owner approves the pull request on GitHub (or publishes it from the Workflow tab, which owners can do
  directly). Owners are allowed to bypass the rule so direct pushes from the command line still work.
- Nothing deploys until a change is merged into `main`.

## Adding a new block type
1. Add it to `blockSchema` in `src/content.config.ts`.
2. Add its editor fields under `blocks > types` in `public/admin/config.yml`.
3. Render it in `src/components/Blocks.astro` with a component from `src/components/ui/`.

## Shared components (`src/components/ui/`)
`Section`, `Button`, `ButtonRow`, `CardGrid`, `Callout`, `Split`, `FaqList`, `MeetingCard`, `Directory`,
`PillList`, `Quote`, `Checklist`, `EventList`. They only use the design tokens in `src/styles/global.css`,
so a change to a color, font size or spacing there changes every page, hand-built or CMS-built.

## Notes
- Markdown in text blocks is trusted content: only give write access to people you trust.
- The CMS preview pane is turned off because it cannot use the site's styles; use the deployed preview.
- The first mention of each defined term (GSR, DCM, and so on) in a text block becomes a popover.

## Publishing waits for the preview
A draft cannot be merged until its `cloudflare-pages/preview` status is green. That status is posted last, after the
draft has been translated and the preview built, so publishing early (including Decap's *Publish now*, even as the repo
owner) is refused for the first minute or so. The rule is a repository ruleset with no bypass, defined in
`.github/rulesets/require-preview.json`; the owner-approval rule is separate and keeps its owner bypass. Pull requests
opened by the catch-up workflow post the status themselves (they only add translation files). If the preview
workflow itself breaks (for example the Cloudflare token expires) merging stops everywhere; fix the workflow, or disable
the ruleset under repo Settings > Rules until it is fixed.

## Spanish and French
Changed English pages and committees are machine-translated for free with DeepL and added to the draft; see
`docs/TRANSLATION.md` (secret `DEEPL_AUTH_KEY`). They stay hidden from search until a bilingual AA member reviews them.

## Preview links on every draft (Cloudflare Pages)
`.github/workflows/preview.yml` builds the real site for each CMS draft (pull request), publishes it to Cloudflare
Pages at its own address, and posts a commit status named `cloudflare-pages/preview`. Decap's `preview_context`
setting shows that as a **View Preview** button. If the build fails, the workflow comments on the draft in plain
language. One-time setup (repo Settings > Secrets and variables > Actions):
1. In Cloudflare: create a Pages project (Direct Upload), e.g. `npx wrangler pages project create area30-preview`.
2. Create an API token with *Cloudflare Pages: Edit* and note your Account ID.
3. Add secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and variable `CLOUDFLARE_PAGES_PROJECT`.
Previews are `noindex`. Hand editors `docs/EDITOR-GUIDE.md`.
