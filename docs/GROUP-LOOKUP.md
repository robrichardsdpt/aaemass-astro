# Group lookup on the contribution form

On the **Group contribution** form, the Group name field is a search box. A visitor types part of a group's name or number
and picks their group from a list. That fills in the group number and, where we are confident, the meeting address, day and
time. Everything stays editable, and if the list cannot load the field is an ordinary text box.

The list is `public/data/area30-groups.json` (about 403 KB, about 35 KB over the wire with Brotli). It is fetched only when
someone clicks or types in the Group name field, and only on the three contribute pages. The code is
`src/lib/group-lookup.ts` (the rules, tested in `scripts/group-lookup.test.mjs`) and `src/scripts/group-lookup.ts` (the form behavior).

The list holds two kinds of group: the **637 numbered groups** from AA's contribution list, and **1,245 groups with no number**
that appear only in published meeting lists (see "Groups with no number" below).

## Where the data comes from

| What | Source | Notes |
| --- | --- | --- |
| Group number, name, district (637 groups) | The "Contribute on behalf of a Group" list on contributions.aa.org, filtered to "030 - Eastern Massachusetts" | Always accurate to what AA World Services shows donors. The page's search stops at 500 results, so it was read one district at a time. |
| Meeting address, day, time | Published meeting lists: aaboston.org (the in-person view), Cape Cod Intergroup's open feed, and the Worcester-area district pages (Districts 23, 24, 26 and the Worcester intergroup) | Matched to groups **by name**. These are meeting listings, not group records, so the match is a best guess. |
| Zip codes | The individual aaboston.org meeting pages (the list pages show street and town only) | |

Snapshot taken **2026-11-19**. New and renamed groups are not picked up until the list is rebuilt.

## What the form does with an address

Each numbered group carries one of four address levels:

| Level | Groups | The form |
| --- | --- | --- |
| `prefill` | 220 | One match, and its town appears in the group's name or in the district's known towns (or a hand-checked override). Fills street, town and zip. |
| `offer` | 150 | One match with nothing to confirm it. Shows "Does your group meet at ...?" with a button to accept. |
| `choose` | 20 | Several candidates (inside the district's towns, or all in one town). Shows a short pick-list. |
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

## Groups with no number

Some groups are in the meeting lists but not in AA's contribution list: unregistered groups, groups registered under another
name, or ones we cannot match. Each meeting that no numbered group already has (same address, day and time) becomes an entry
with an empty `id`, so a donor from that group still gets its name, address, day and time filled in. Meetings with the same
name at the same address merge into one entry with all their days and times (`scripts/group-data/unnumbered.py`).

On the form, such a group shows in the results as "Copley Noontime · Trinity Church, Boston" (where it meets, in place of the
district and number a numbered group shows). Choosing it fills the group
name, address, day and time and **leaves the Group number empty**, with a note asking the donor to enter it (the number field
stays required, and the registrar's email is in the note). These groups are found by name, location name or town, and they are
listed after numbered groups that match equally well. There is no district for them.

## Hand-checked overrides

The listings cannot always say which meeting belongs to which group. When someone who knows has confirmed it, add the group to
`scripts/group-data/overrides.json` and its address, day and time replace the guess. Overrides are applied last
(`finalize.py`), so rebuilding the list never loses them.

Each entry is keyed by the 9-digit group number and holds the group's `name`, a `why` note, the `address` level
(`prefill`, `offer`, `choose` or `none`) and its `options` (place, street, town, zip, and meetings as `day` 0 for Sunday
through 6 and a 24-hour `time`). `prefill` and `offer` need exactly one address. See the Copley Friday Group entry for an example.

If a group is later renamed or removed, rebuilding stops with a message naming the override instead of quietly using it, so
someone can check it.

## Rebuilding the list

1. In a work folder, put:
   - `area30-groups.csv` (columns `group_id,name,district`): read from the contributions.aa.org dropdown as described above;
   - `contrib/inperson.html`: `https://aaboston.org/meetings?tsml-day=any&tsml-attendance_option=in_person`;
   - `dist/wor.html`, `dist/d26.html`, `dist/wp_District23.html`, `dist/wp_District24.html`: the `MeetingList.aspx?GRP=...` pages on aaworcester.org and the district sites (optional; skipped if missing);
   - `dist/cape.json`: `https://capecodaa.net/wp-json/tsml/meetings`.
2. `python3 -I scripts/group-data/build.py <work-folder>` matches groups to meetings and writes `data/suggestions.json` (numbered groups) and `data/pool.json` (every meeting with a street address, for the groups with no number).
3. `python3 -I scripts/group-data/zips.py <work-folder>` looks up the zips still missing, one page per address (about 1.2 seconds per page; re-runs skip pages already done). A full rebuild looks up a few hundred pages, so be patient and gentle.
4. `python3 -I scripts/group-data/finalize.py <work-folder> public/data/area30-groups.json` applies the overrides, adds the groups with no number and writes the file. `assemble.py` builds the list for both steps 3 and 4, so they always agree.

The matching rules and the overrides have tests: `python3 -I -m unittest discover -s scripts/group-data`.

The scripts use only the Python standard library.

## Things worth knowing

- **Be gentle with other people's sites.** aaboston.org's JSON feed is restricted by its owner, so only the public pages are read, one request at a time. If the Central Service Office shares a TSML sharing key, the feed carries each meeting's group name and would replace the name matching with something far more reliable.
- **Group numbers and meeting addresses are already public** (the contribution page, the meeting lists). The registrar's records are not used.
- **The number is filled zero padded** (`000043137`), exactly as aa.org shows it. Searching works either way: `43137` and `000043137` both find the group.
- **Spanish and French wording** for the lookup messages (`group.lookup` in `src/i18n/pages/contribute.ts`) was written by Claude and should be checked by a fluent reader.
