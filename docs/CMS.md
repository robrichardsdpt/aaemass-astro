# Content management (Decap CMS)

Editors use a web form at `/admin/`. Every save becomes a commit to `main`, and GitHub Actions rebuilds
the site in about a minute. Nothing runs on a server.

## What editors can do
- **Pages**: create a page from blocks (text, cards, callout, image and text, FAQ, contact list, meeting
  details, link pills, quote, buttons, checklist, upcoming events). Drag blocks by the grip to reorder them.
  The page appears at `/<file-name>/`, gets a breadcrumb, structured data and a sitemap entry automatically.
  FAQ blocks also become `FAQPage` markup.
- **Events**: each event gets `/events/<name>/` with `Event` markup, plus Spanish and French pages once translated (see `docs/TRANSLATION.md`). Editors pick a date and Eastern start/end times with the browser's native pickers (`public/admin/widgets.js`); they are stored as plain `date`, `start_time`, `end_time` and `end_date` and converted to real instants in `src/content.config.ts`, so the editor's own time zone never matters. Older files with a full `start` timestamp still work. Past events leave the lists and the
  sitemap, and their pages say "This event has passed".
- **Committees**: one file per committee in `src/content/committees/`. It drives the committee page, the picture
  tiles and "also" list on the home and Committees pages, and the Contact page directory (conference and standing
  lists, plus the structured data). Adding a committee in the CMS adds all of those. Files are validated at build
  time (valid email, required fields for committees with a page), so a bad edit fails the build instead of going live.
  Spanish and French committee text still lives in `src/i18n/pages/committees.ts` and `src/i18n/committees.ts`;
  a new committee shows its English text in those languages until someone adds translations there. Picture tiles
  use the six bundled photos; a new tile picture needs a developer.
- **Districts**: one file per district in `src/content/districts/`, filled in as structured fields (when it meets,
  online meeting, in-person meeting, website, mail address). `src/lib/districts.ts` turns them into the standard card
  lines, worded exactly as the Spanish and French translator (`src/i18n/districts.ts`) expects. Anything that does not
  fit goes in `extra_lines` (District 27 uses this for its bilingual lines).
- **Site settings pages**: Home, Contribute, Resources, Literature, What is AA?, Registrar, 12th Step Volunteer, Calendar
  and Services (`src/content/site/<page>.yml`). They hold the English text an editor may change, checked against the
  English in `src/i18n/pages/<page>.ts` (an unknown or mistyped field fails the build). Anything not in those files stays
  in the code: the mailing-list and volunteer forms and their messages, and on Contribute the whole payment form.
  Lists (FAQs, steps, links, committees on Services) can be added to, removed or reordered. Every page also has
  **Extra sections** at the bottom, where editors add any of the page blocks (`extra_blocks` in the file, validated against
  `src/lib/blocks-schema.ts`). Spanish and French are generated automatically (see `docs/TRANSLATION.md`, "Pages edited in the
  CMS"): `src/lib/editable-pages.ts` picks, per text, a fresh machine translation, else the translation in the code, else English.
- **Site notice**: Site settings. A bar above the header on every page, with an optional last day (`src/content/site/notice.yml`);
  the build drops it after that day (the site rebuilds daily). It shows in English on every language version.

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

## Signed plugin updates (why a collaborator can not push code to the live site)
The WordPress plugin updates itself from the `plugin-latest` release, so whoever could change that release could run code
on the site. To prevent that, every release carries `aa30-home.sig`, an Ed25519 signature over the zip and its version,
and the plugin installs nothing without a valid one.
- **The private key** is the secret `PLUGIN_SIGNING_KEY` of the GitHub *environment* `release`, which only the `main`
  branch may use (Settings > Environments > release). A branch that edits `plugin.yml` and runs it cannot read the key, so
  it can publish a release, but not one the plugin will accept. Only a change merged to `main` (owner-approved) is signed.
- **The public key** is `AA30_UPDATE_PUBLIC_KEY` in `wp-plugin/aa30-home/includes/updater.php`. The release workflow checks
  its own signature against that key before publishing (a wrong or missing secret stops the release, leaving the last
  good one in place).
- **What is signed:** `aa30-home-plugin`, the version and the SHA-256 of the zip, so an old signed zip cannot be replayed as
  a newer version. The plugin downloads the zip and signature itself and refuses the install if they do not match.
- **Unaffected:** uploading the zip by hand in wp-admin (you are the one doing it).
- **Rotating the key:** `node scripts/sign-plugin.mjs keygen` prints the private key (stdout) and the public key (stderr).
  Store the private key as `PLUGIN_SIGNING_KEY` in the `release` environment (`... | gh secret set PLUGIN_SIGNING_KEY
  --env release`), and put the new public key in `updater.php`. Installed sites trust the OLD key, so that release must be
  signed with the old key: merge the `updater.php` change first (signed by the old secret), then swap the secret.
- **Losing the key** only stops updates: generate a new pair and install one release by hand.
- **The one remaining trust:** whoever can merge to `main` can ship code. Keep two-factor authentication (a passkey) on
  the owner's GitHub account.
Tests: `node scripts/sign-plugin.test.mjs`, and the PHP side in `wp-plugin/tests/run.php` (it verifies a signature made by
Node, the signer CI uses).

## Hardening for editors
- **Sign-in scope.** `backend.auth_scope: public_repo` in `public/admin/config.yml`, and the OAuth worker always requests
  `public_repo`, so an editor's token can only touch public repositories (Decap otherwise asks GitHub for the broad `repo`
  scope, which includes all of an editor's private repositories). The worker change takes effect when it is redeployed
  (`cd oauth-worker && npx wrangler deploy`). If this repository is ever made private, change both back to `repo`.
- **Editor HTML is cleaned.** Markdown allows raw HTML, so everything an editor writes in page blocks and events passes through
  `src/lib/sanitize.ts` (an allowlist: text, headings, lists, links, images, tables, quotes, code). `<script>`, `<iframe>`,
  forms, `onclick`-style handlers and `javascript:` / `data:` links are removed; links may be https, http, mailto, tel or a
  path on this site. Committee text and district lines were already safe: they are HTML-escaped before links are added.
  Tests: `node scripts/sanitize.test.mjs`.

## Preview clean-up
Each draft's preview is publicly reachable by its link and Cloudflare never expires it. `cleanup-previews.yml` deletes a
draft's previews when its pull request is closed or merged, and sweeps weekly (Mondays) and on demand for any missed.
It only touches Preview deployments on `pr-<number>` branches, never production and never a draft that is still open
(`scripts/cleanup-previews.mjs`; tests: `node scripts/cleanup-previews.test.mjs`). To check by hand:
`npx wrangler pages deployment list --project-name area30-preview`.

## Removing content
Decap deletes a published entry by committing straight to `main`, which the branch rules refuse (a pull request, the
owner's approval and a finished preview are required), so the Delete button does not work on published entries. Instead
events, pages, committees and districts have a **Remove from the website** checkbox. Once published, the site ignores
the entry (see `src/lib/live-content.ts`, the committee and district loaders and the sitemap), and the *Remove content*
workflow (`remove-content.yml`, script `scripts/remove-content.mjs`) opens a pull request that deletes the file and its
Spanish and French copies. It builds the site first and opens nothing if the build breaks (for example when another
page depends on what is being removed). Run it by hand to remove several entries at once. Tests:
`node scripts/remove-content.test.mjs`.

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
