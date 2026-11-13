# The Calendar page

`/calendar/` shows Area 30's events from the same data as Explore events. There are no Google Calendar frames (they cost
about 2 seconds of blocking time, a third-party cookie and 700 KB per visit, and truncated titles).

## What is on the page
- **A month grid** (screens 56rem wide and up; `src/scripts/calendar-month.ts`). Fixed height (six rows), a day with
  more events than fit shows "N more", and clicking a day number or "N more" opens a small popup with the whole day and full
  titles. Clicking an event opens its details in the Explore events window. **Multi-day events** (all-day, two days or
  more) are one bar across the days, continuing onto the next week, with overlapping ones stacked (`weekSpans` in
  `src/lib/calendar-grid.ts`). Earlier months load only if someone goes back past the current month.
- **A list of the next 30 days**, in the page itself (so search engines and people without JavaScript see it, and it is the
  whole calendar on phones). Phones and tablets do not download the month data at all.
- **Colours by type** (`kindOf` in `src/lib/calendar-grid.ts`, from the event title, because Google Calendar has no
  categories): district meetings, committee and service meetings, area events and assemblies. If a new kind of title is
  coloured wrongly, add a word to the patterns there (and a line to `scripts/calendar.test.mjs`).
- Links to add the calendar to Google, Apple and others, the time the page was built, and a link to the live Google Calendar.

## Where the data comes from
| File | What | When it is read |
| --- | --- | --- |
| `events/calendar.json` | this month onward, as lean records (about 100 KB, 10 KB compressed) | when the month view loads |
| `events/calendar-history.json` | everything before this month, back to the start of the feed (about 190 KB, 26 KB compressed) | only when someone goes back past this month |
| `events/search.json` | the full index for Explore events | when Explore events opens |

All three are made at build time from the public Google Calendar feed (`src/lib/gcal.ts`), the WordPress events calendar
and the CMS's highlighted events. **It is a snapshot, not live.** The site is rebuilt every six hours
(`.github/workflows/pages.yml`) and the WordPress plugin is rebuilt daily (`.github/workflows/plugin.yml`), and on every merge
to `main`. For something urgent (a cancelled assembly) use the **Site notice** in the CMS: it is published immediately.
Events that are already over have no page and are not in Explore events, so they are plain muted text that opens the day's list.

## Checking the data
The page was checked against an independent reading of the Google feed (a different calendar library, Python's `icalendar` +
`recurring-ical-events`), comparing `(UID, start in UTC)` and titles.
- **Current and upcoming (Oct 30, 2026 to May 2028): 725 of 725 identical**, including repeating series, overrides, all-day and
  multi-day events.
- **History (back to Jan 2023): 2,170 of 2,175.** The five or six that differ are old events from early 2025, in series
  whose first date does not fall on a day the repeat rule allows, or that are written in UTC across the March 2025 daylight-saving
  change, where two correct readers disagree (an hour, or an extra first date). All of those series ended in 2025, so
  nothing current or future is affected.
To repeat the check: download the feed (the URL is in `src/lib/gcal.ts`), expand it with the library above, and compare against
`dist/events/calendar.json` and `dist/events/calendar-history.json`.

## Limits
- Events are included for 18 months ahead.
- Only all-day events that last more than a day become bars; a timed event that runs past midnight is shown on the day it starts.
- Spanish and French pages show the same events (titles are not translated). Repeating dates are plain text there, because
  the Explore events window is English only.
- WordPress-calendar events from before this month are not in the history (only the Google Calendar is).
