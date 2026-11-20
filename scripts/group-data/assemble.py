"""Builds the full group list from the work folder: numbered groups (build.py), the hand-checked overrides, then the groups that
have no number. Shared by zips.py (to learn which zip codes are still needed) and finalize.py (to write the file), so the two
always agree. Standard library only.
"""
import json
import os
import re

from overrides import apply_overrides
from unnumbered import unnumbered_groups

HERE = os.path.dirname(os.path.abspath(__file__))


def load_zips(work):
    try:
        return json.load(open(f'{work}/data/zips.json'))
    except FileNotFoundError:
        return {}


def assemble(work, zips):
    """Returns (groups, overrides_applied, urls_without_zip). `zips` maps a meeting page's url to its zip code."""
    suggestions = json.load(open(f'{work}/data/suggestions.json'))
    pool = json.load(open(f'{work}/data/pool.json'))
    numbered, missing = [], set()
    for r in suggestions:
        options = []
        for o in r['options']:
            zip_code = o['zip'] or zips.get(o['url'], '')
            if not zip_code and o['url']:
                missing.add(o['url'])
            options.append(dict(street=o['street'], town=o['town'], zip=zip_code, place=o.get('place', ''), meetings=o['meetings']))
        numbered.append(dict(id=r['group_id'], name=r['name'], district=r['district'], address=r['action'], options=options))
    numbered.sort(key=lambda g: (g['name'].lower(), g['id']))
    overrides = json.load(open(os.path.join(HERE, 'overrides.json')))
    apply_overrides(numbered, overrides)
    extra = unnumbered_groups(pool, numbered, zips)
    # A zip found through any one meeting page at an address serves every meeting there, so one lookup per address is enough.
    address = lambda o: (o['street'].lower().rstrip('.').strip(), o['town'].lower().strip())
    need = {address(o) for g in extra for o in g['options'] if not o['zip']}
    page_for = {}
    for m in pool:
        if m.get('url') and address(m) in need:
            page_for.setdefault(address(m), m['url'])
    missing |= set(page_for.values())
    return numbered + extra, len(overrides), sorted(missing)


def check(groups):
    assert len({g['id'] for g in groups if g['id']}) == len([g for g in groups if g['id']]), 'duplicate group numbers'
    assert all(re.fullmatch(r'\d{9}', g['id']) for g in groups if g['id']), 'group numbers must be 9 digits'
    assert all(re.fullmatch(r'\d{5}', o['zip']) for g in groups for o in g['options'] if o['zip']), 'zip codes must be 5 digits'
