# Group lookup on the contribution form

On the **Group contribution** form, the Group name field is a search box. A visitor types part of a group's name or number
and picks their group from a list. That fills in the group number and, where we are confident, the meeting address, day and
time. Everything stays editable, and if the list cannot load the field is an ordinary text box.

The list is `public/data/area30-groups.json` (about 129 KB, about 15 KB over the wire). It is fetched only when someone clicks
or types in the Group name field, and only on the three contribute pages. The code is `src/lib/group-lookup.ts` (the rules,
tested in `scripts/group-lookup.test.mjs`) and `src/scripts/group-lookup.ts` (the form behavior).

## Where the data comes from

| What | Source | Notes |
| --- | --- | --- |
| Group number, name, district (637 groups) | The "Contribute on behalf of a Group" list on contributions.aa.org, filtered to "030 - Eastern Massachusetts" | Always accurate to what AA World Services shows donors. The page's search stops at 500 results, so it was read one district at a time. |
| Meeting address, day, time | Published meeting lists: aaboston.org (the in-person view), Cape Cod Intergroup's open feed, and the Worcester-area district pages (Districts 23, 24, 26 and the Worcester intergroup) | Matched to groups **by name**. These are meeting listings, not group records, so the match is a best guess. |
| Zip codes | The individual aaboston.org meeting pages (the list pages show street and town only) | |

Snapshot taken **2026-11-19**. New and renamed groups are not picked up until the list is rebuilt.

## What the form does with an address

Each group carries one of four address levels:

| Level | Groups | The form |
| --- | --- | --- |
| `prefill` | 219 | One match, and its town appears in the group's name or in the district's known towns. Fills street, town and zip. |
| `offer` | 150 | One match with nothing to confirm it. Shows "Does your group meet at ...?" with a button to accept. |
| `choose` | 21 | Several candidates (inside the district's towns, or all in one town). Shows a short pick-list. |
| `none` | 247 | No reliable match. The person types the address. |

Options show the location's name from the listing ("Old South Church, 645 Boylston St, Boston 02116"), so people can
recognise the place.

There are two passes. The **first** matches the group's name to a meeting's name. "The district's known towns" are learned
from the groups that matched exactly one address, so a generic name such as "Serenity Group" only keeps the candidate in the
group's own district. The **second** pass (`scripts/group-data/matching.py`) handles groups the first could not place: group
names often share a place, a day or a time of day with a listing without sharing its name ("Copley Friday Group" and "Copley
Square" on Friday). It weighs each word in the group's name by how rare it is across all meetings, requires the rarest word
to appear in the meeting's name, location name or town, and uses a day ("Friday", "Sun") or time-of-day word ("Noon",
"Night") in the group's name to rule out meetings at other times. Its results are **never pre-filled**: one address is
offered, and several become a pick-list only when they are all in the same town. A district's towns, learned only from
groups whose own name contains the town, can rule candidates out.

Day and time follow the same idea: one meeting at the chosen address is filled in, two to seven become a "Which meeting is
this contribution for?" pick-list, and a group that meets every day (more than seven) gets no help. Fields the visitor has
already typed in are never overwritten by a suggestion. Only an explicit click on "Use this address" or a meeting button replaces them.

## Rebuilding the list

1. In a work folder, put:
   - `area30-groups.csv` (columns `group_id,name,district`): read from the contributions.aa.org dropdown as described above;
   - `contrib/inperson.html`: `https://aaboston.org/meetings?tsml-day=any&tsml-attendance_option=in_person`;
   - `dist/wor.html`, `dist/d26.html`, `dist/wp_District23.html`, `dist/wp_District24.html`: the `MeetingList.aspx?GRP=...` pages on aaworcester.org and the district sites (optional; skipped if missing);
   - `dist/cape.json`: `https://capecodaa.net/wp-json/tsml/meetings`.
2. `python3 -I scripts/group-data/build.py <work-folder>` matches groups to meetings and writes `data/suggestions.json`.
3. `python3 -I scripts/group-data/zips.py <work-folder>` looks up zips (about 1.2 seconds per page; re-runs skip pages already done).
4. `python3 -I scripts/group-data/finalize.py <work-folder> public/data/area30-groups.json`.

The matching rules have tests: `python3 -I -m unittest discover -s scripts/group-data`.

The scripts use only the Python standard library.

## Things worth knowing

- **Be gentle with other people's sites.** aaboston.org's JSON feed is restricted by its owner, so only the public pages are read, one request at a time. If the Central Service Office shares a TSML sharing key, the feed carries each meeting's group name and would replace the name matching with something far more reliable.
- **Group numbers and meeting addresses are already public** (the contribution page, the meeting lists). The registrar's records are not used.
- **The number is filled zero padded** (`000043137`), exactly as aa.org shows it. Searching works either way: `43137` and `000043137` both find the group.
- **Spanish and French wording** for the lookup messages (`group.lookup` in `src/i18n/pages/contribute.ts`) was written by Claude and should be checked by a fluent reader.
