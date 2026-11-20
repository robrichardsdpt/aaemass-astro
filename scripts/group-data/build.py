"""Step 1 of 3 (see docs/GROUP-LOOKUP.md). Merge meeting listings and attach address, day and time suggestions to the group list.

Usage: python3 -I scripts/group-data/build.py <work-folder>
The work folder holds the inputs (area30-groups.csv, contrib/inperson.html, dist/*.html, dist/cape.json) and receives data/suggestions.json.
Decision per group:
  prefill - one address, confirmed by the group's name or the district's known towns
  offer   - one address, not confirmed: the form shows it and the person accepts it
  choose  - two to four addresses left after the district's towns are applied: a pick-list
  none    - no match, or too many candidates to be useful
"""
import csv, difflib, html, json, re, sys, collections

S = sys.argv[1]
STOP = {'group', 'gp', 'meeting', 'the', 'aa', 'a', 'of', 'and', 'step', 'steps', 'in', 'at', 'hybrid', 'virtual'}


def toks(s):
    return frozenset(w for w in re.sub(r"[^a-z0-9 ]", ' ', s.lower()).split() if w not in STOP)


def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def table_rows(path, cols):
    h = open(path, encoding='utf-8', errors='replace').read()
    out = []
    for r in re.findall(r'<tr[ >].*?</tr>', h[h.find('<tbody') if '<tbody' in h else 0:], re.S):
        tds = re.findall(r'<td([^>]*)>(.*?)</td>', r, re.S)
        if cols == 'boston':
            d = {}
            when = None
            for attrs, inner in tds:
                c = re.search(r'class="([^"]*)"', attrs)
                key = c.group(1).split()[0] if c else '?'
                d[key] = clean(inner)
                if key == 'time':
                    s = re.search(r'data-sort="(\d)-(\d\d:\d\d)-', attrs)
                    when = (int(s.group(1)), s.group(2)) if s else None
            link = re.search(r'href="(https://aaboston\.org/meetings/[^"?]+)', r)
            if d.get('name') and d.get('address'):
                out.append(dict(name=d['name'], location=d.get('location', ''), street=d['address'],
                                town=d.get('region', ''), url=link.group(1) if link else '', src='boston', when=when))
        else:  # worcester-platform: Start, End, Town, Meeting, Location, Address, Type
            c = [clean(i) for _, i in tds]
            if len(c) >= 8 and c[0] == '' and re.match(r'\d', c[1]):
                out.append(dict(name=c[4], location=c[5], street=c[6], town=c[3], url='', src=cols))
    return out


meetings = table_rows(f'{S}/contrib/inperson.html', 'boston')
for tag, f in [('wai', 'dist/wor.html'), ('d26', 'dist/d26.html'), ('d23', 'dist/wp_District23.html'), ('d24', 'dist/wp_District24.html')]:
    try:
        meetings += table_rows(f'{S}/{f}', tag)
    except FileNotFoundError:
        pass
for m in json.load(open(f'{S}/dist/cape.json')):
    fa = m.get('formatted_address') or ''
    parts = [p.strip() for p in fa.split(',')]
    if len(parts) >= 3 and not (m.get('location') or '').lower().startswith('online'):
        zipm = re.search(r'\b(\d{5})\b', fa)
        day, tm = m.get('day'), m.get('time')
        when = (int(day), tm) if str(day).isdigit() and re.match(r'\d\d:\d\d$', str(tm or '')) else None
        meetings.append(dict(name=m.get('group') or m['name'], location=m.get('location', ''), street=parts[0],
                             town=parts[1], zip=zipm.group(1) if zipm else '', url='', src='cape', when=when))

meetings = [m for m in meetings if re.match(r'\d', m['street']) and not re.search(r'\bMA$', m['street'])]
for m in meetings:
    m['tokens'] = toks(m['name'])
    m['town_tokens'] = toks(m['town'])
    m['addr'] = (m['street'].lower().rstrip('.'), m['town'].lower())

by_tokens = collections.defaultdict(list)
for m in meetings:
    by_tokens[m['tokens']].append(m)
    by_tokens[m['tokens'] | m['town_tokens']].append(m)
all_keys = list(by_tokens)

groups = list(csv.DictReader(open(f'{S}/area30-groups.csv', encoding='utf-8')))


def candidates(name):
    t = toks(name)
    ms = by_tokens.get(t)
    how = 'name'
    if not ms:
        close = difflib.get_close_matches(' '.join(sorted(t)), [' '.join(sorted(k)) for k in all_keys], n=1, cutoff=0.92)
        if close:
            ms = by_tokens[next(k for k in all_keys if ' '.join(sorted(k)) == close[0])]
            how = 'close'
    return (ms or []), how


def distinct(ms):
    seen = {}
    for m in ms:
        entry = seen.setdefault(m['addr'], dict(m, whens=set()))
        if m.get('when'):
            entry['whens'].add(m['when'])
    return list(seen.values())


pass1 = []
for g in groups:
    ms, how = candidates(g['name'])
    pass1.append((g, distinct(ms), how))

# Learn which towns belong to which district from groups that matched exactly one address.
district_towns = collections.defaultdict(collections.Counter)
for g, ds, how in pass1:
    if len(ds) == 1 and how == 'name':
        district_towns[g['district']][ds[0]['town'].lower()] += 1

def learned_towns(g, ds):
    """Towns known for this group's district, leaving this group's own unique match out."""
    c = collections.Counter(district_towns.get(g['district'], {}))
    if len(ds) == 1 and how_of[g['group_id']] == 'name':
        c[ds[0]['town'].lower()] -= 1
    return {t for t, n in c.items() if n > 0}


how_of = {g['group_id']: how for g, ds, how in pass1}
result, stats = [], collections.Counter()
for g, ds, how in pass1:
    narrowed = False
    known = learned_towns(g, ds)
    if len(ds) > 1:
        keep = [d for d in ds if d['town'].lower() in known]
        ds, narrowed = (keep, True) if keep else ([], False)
    if len(ds) == 1:
        town = ds[0]['town'].lower()
        corroborated = town in known or ds[0]['town_tokens'] <= toks(g['name'])
        action = 'prefill' if corroborated else 'offer'
    elif 2 <= len(ds) <= 4:
        action = 'choose'
    else:
        action = 'none'
        ds = []
    stats[action + ('+district' if narrowed and action != 'none' else '')] += 1
    result.append(dict(group_id=g['group_id'], name=g['name'], district=g['district'], action=action,
                       match=how if ds else '', narrowed=narrowed,
                       options=[dict(street=d['street'], town=d['town'], zip=d.get('zip', ''), url=d['url'], src=d['src'],
                                     meetings=[dict(day=day, time=tm) for day, tm in sorted(d['whens'])]) for d in ds]))

json.dump(result, open(f'{S}/data/suggestions.json', 'w'), indent=1)
print('meetings pooled:', len(meetings), dict(collections.Counter(m['src'] for m in meetings)))
print('groups:', len(groups), dict(stats))
print('need zip lookups (distinct boston urls among options):', len({o['url'] for r in result for o in r['options'] if o['url'] and not o['zip']}))
