# Content management (Decap CMS)

Editors use a web form at `/admin/`. Every save becomes a commit to `main`, and GitHub Actions rebuilds
the site in about a minute. Nothing runs on a server.

## What editors can do
- **Pages**: create a page from blocks (text, cards, callout, image and text, FAQ, contact list, meeting
  details, link pills, quote, buttons, checklist, upcoming events). Drag blocks by the grip to reorder them.
  The page appears at `/<file-name>/`, gets a breadcrumb, structured data and a sitemap entry automatically.
  FAQ blocks also become `FAQPage` markup.
- **Events**: each event gets `/events/<name>/` with `Event` markup. Past events leave the lists and the
  sitemap, and their pages say "This event has passed".
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
