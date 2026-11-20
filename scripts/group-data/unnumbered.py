"""Groups that appear in the published meeting lists but have no group number in AA's contribution list.

A group may be unregistered, or registered under a different name than its listing, or in a part of the list we cannot match.
Either way a donor from such a group is helped by finding it, and getting its name, address, day and time filled in. The
group number is left for the donor (or the registrar) to supply.

A meeting is skipped when a numbered group already has it (same address, day and time), so one group never appears twice.

Standard library only. Tests: python3 -I -m unittest discover -s scripts/group-data
"""
import re


def clean_name(name):
    """A meeting name without the listing's attendance tag: "Sunrise Serenity (Hybrid)" -> "Sunrise Serenity"."""
    return re.sub(r'\s*\((hybrid|virtual|in-person|online)[^)]*\)\s*', ' ', name, flags=re.I).strip()


def place_name(location):
    """The location's name without the listing's "In-person and Online" style suffix: "Old South Church In-person and Online" -> "Old South Church"."""
    return re.sub(r'\s*\b(in-person and online|in-person|online|hybrid)$', '', location.strip(), flags=re.I).strip()


def _address(street, town):
    return (street.lower().rstrip('.').strip(), town.lower().strip())


def _claimed(groups):
    """(address, day, time) of every meeting a numbered group already has, and (address, None, None) for an address it has with no times."""
    claimed = set()
    for g in groups:
        for o in g['options']:
            a = _address(o['street'], o['town'])
            if not o['meetings']:
                claimed.add((a, None, None))
            for m in o['meetings']:
                claimed.add((a, m['day'], m['time']))
    return claimed


def unnumbered_groups(pool, groups, zip_lookup=None):
    """One entry per (name, address) among the pool's meetings that no numbered group has, in the same shape as the numbered groups.

    pool: dicts with name, location, street, town, when ((day, "HH:MM") or None), zip and url.
    groups: the numbered groups as they will be written (options with street, town, zip and meetings).
    zip_lookup: zip codes found by looking up each meeting's own page, by url.
    """
    zip_lookup = zip_lookup or {}
    claimed = _claimed(groups)
    # A zip found for any meeting at an address serves every meeting there.
    zip_at = {_address(o['street'], o['town']): o['zip'] for g in groups for o in g['options'] if o['zip']}
    for m in pool:
        found = m.get('zip') or zip_lookup.get(m.get('url', ''))
        if found:
            zip_at.setdefault(_address(m['street'], m['town']), found)
    entries = {}
    for m in pool:
        a = _address(m['street'], m['town'])
        when = tuple(m['when']) if m.get('when') else None
        if (a, *when) in claimed if when else (a, None, None) in claimed:
            continue
        name = clean_name(m['name'])
        entry = entries.setdefault((name.lower(), a), dict(
            id='', name=name, district='', address='prefill',
            options=[dict(street=m['street'], town=m['town'], zip='', place=place_name(m['location']), meetings=[])]))
        option = entry['options'][0]
        option['zip'] = zip_at.get(a, '')
        if when and dict(day=when[0], time=when[1]) not in option['meetings']:
            option['meetings'].append(dict(day=when[0], time=when[1]))
    for entry in entries.values():
        entry['options'][0]['meetings'].sort(key=lambda x: (x['day'], x['time']))
    return sorted(entries.values(), key=lambda e: (e['name'].lower(), e['options'][0]['town'].lower(), e['options'][0]['street'].lower()))
