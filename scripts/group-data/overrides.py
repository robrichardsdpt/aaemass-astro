"""Hand-checked corrections to the group list (see overrides.json and docs/GROUP-LOOKUP.md).

The address, day and time for most groups are matched from published meeting lists, which can only guess which meeting belongs
to which group. Where someone who knows has confirmed it, an override replaces the guess for that group. finalize.py applies the
overrides last, so rebuilding the list never loses them.

Standard library only. Tests: python3 -I -m unittest discover -s scripts/group-data
"""
import re

LEVELS = {'prefill', 'offer', 'choose', 'none'}


def _check_option(group_id, option):
    where = f'override {group_id}'
    for field in ('street', 'town'):
        if not str(option.get(field, '')).strip():
            raise ValueError(f'{where}: every address needs a {field}')
    if option.get('zip', '') and not re.fullmatch(r'\d{5}', option['zip']):
        raise ValueError(f'{where}: the zip code must be 5 digits')
    for meeting in option.get('meetings', []):
        if not (isinstance(meeting.get('day'), int) and 0 <= meeting['day'] <= 6):
            raise ValueError(f'{where}: a meeting day must be 0 (Sunday) to 6 (Saturday)')
        if not re.fullmatch(r'([01]\d|2[0-3]):[0-5]\d', str(meeting.get('time', ''))):
            raise ValueError(f'{where}: a meeting time must be 24-hour HH:MM, like 17:30')


def apply_overrides(groups, overrides):
    """Replaces the address level and addresses of the listed groups. Fails loudly rather than guessing when an override no
    longer fits the list, for example because the group was renamed or removed."""
    by_id = {g['id']: g for g in groups}
    for group_id, o in overrides.items():
        group = by_id.get(group_id)
        if group is None:
            raise ValueError(f'override {group_id} ("{o.get("name")}") is not in the group list: remove it or fix its number')
        if group['name'] != o.get('name'):
            raise ValueError(f'override {group_id} is for "{o.get("name")}" but the group is now "{group["name"]}": it was renamed, so check the override')
        if o.get('address') not in LEVELS:
            raise ValueError(f'override {group_id}: the address level must be one of {sorted(LEVELS)}')
        options = o.get('options', [])
        if o['address'] in ('prefill', 'offer') and len(options) != 1:
            raise ValueError(f'override {group_id}: {o["address"]} needs exactly one address')
        for option in options:
            _check_option(group_id, option)
        group['address'] = o['address']
        group['options'] = [
            dict(street=x['street'], town=x['town'], zip=x.get('zip', ''), place=x.get('place', ''),
                 meetings=[dict(day=m['day'], time=m['time']) for m in x.get('meetings', [])])
            for x in options
        ]
    return groups
