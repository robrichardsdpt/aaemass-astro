"""Step 3 of 3 (see docs/GROUP-LOOKUP.md). Merge the zip codes and write the file the contribution form loads.

Usage: python3 -I scripts/group-data/finalize.py <work-folder> public/data/area30-groups.json
"""
import json, re, sys

work, out_path = sys.argv[1:3]
suggestions = json.load(open(f'{work}/data/suggestions.json'))
zips = json.load(open(f'{work}/data/zips.json'))

groups = []
for r in suggestions:
    options = [dict(street=o['street'], town=o['town'], zip=o['zip'] or zips.get(o['url'], ''), meetings=o['meetings'])
               for o in r['options']]
    groups.append(dict(id=r['group_id'], name=r['name'], district=r['district'], address=r['action'], options=options))
groups.sort(key=lambda g: (g['name'].lower(), g['id']))

assert len({g['id'] for g in groups}) == len(groups), 'duplicate group numbers'
assert all(re.fullmatch(r'\d{9}', g['id']) for g in groups), 'group numbers must be 9 digits'
assert all(re.fullmatch(r'\d{5}', o['zip']) for g in groups for o in g['options'] if o['zip']), 'zip codes must be 5 digits'

json.dump(groups, open(out_path, 'w'), separators=(',', ':'), ensure_ascii=False)
print(f'{len(groups)} groups written to {out_path}')
