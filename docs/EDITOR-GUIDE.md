# How to update the Area 30 website

You do not need to know any code. Everything is done at **the site address + /admin/** with your GitHub sign-in.
Nothing you change goes live right away: your change becomes a **draft** that a reviewer checks first.

## The three steps
1. **Edit** what you need (see below) and click **Save**. This creates a draft.
2. **Look at the preview.** In a minute or two a **View Preview** link appears on your draft. It is the real
   website with your change in it. Check that it looks right. If not, edit and Save again.
   Publishing is refused until the preview is ready (about a minute), so if it says it cannot publish yet, wait for the
   **View Preview** link and try again.
3. **Send it for review.** At the top of the draft, set the status to **Ready**. The reviewer will check it and
   publish it. You will not see it on the live site until they do.

If the preview says it "can't be previewed yet", a field has a mistake (usually an email address that is not
complete). Fix the field named in the message and Save again.

## Common jobs
**Add an event** — Events > New Event. Fill in the name, a one-sentence summary and when it starts. Add the place or
an online link. Past events leave the lists on their own.

**Change a committee's email or details** — Committees > pick the committee. Change the email or the text and Save.
The committee page, the committee lists and the Contact page all update together.

**Add a committee** — Committees > New Committee. Enter the name, email, and whether it is a Conference or Standing
committee. If it should have its own page, fill in the label, intro sentence, search description and call to action.
Pick a Display order between two existing committees to place it (they go up by 10).

**Update a district** — Districts > pick the district. Each row is one line on that district's card. Follow the examples
under the field so the Spanish and French pages translate correctly.

**Change the officer emails, general email or mailing address** — Site settings > Contact details and officers.

**Change the main menu** — Site settings > Main menu. Drag items to reorder.

## Remove something from the website
Do **not** use the Delete button on something that is already published; it cannot work, because deleting skips the
review step. Instead open the entry, tick **Remove from the website** (the last box in the form), and save. When the
draft is published, the entry disappears from the site. A follow-up change then deletes its files, and the owner approves
that too.

To remove several things at once, the owner can run **Actions > Remove content > Run workflow** on GitHub and list them
(for example `events/2026-12-holiday-dinner, pages/old-page`). The CMS itself has no way to select several entries.

Deleting a draft you have not published yet is different: that just discards the draft.

## Good to know
- Spanish and French versions of a **new** committee or page show in English until a translator adds them.
- You cannot break the site by saving a draft. Nothing changes until the reviewer publishes it.
- Need a new picture tile, a new kind of page, or a design change? Ask the reviewer; those need a developer.
