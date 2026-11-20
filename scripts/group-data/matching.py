"""Second-pass matching of a group to published meetings, used by build.py for groups the exact-name pass could not place.

Group names rarely equal the meeting names on listings, but they usually carry the same clues: a place ("Copley"), a day
("Friday") and sometimes a time of day ("Noon", "Night"). A meeting is a candidate when most of the group's place words
appear in the meeting's name, its location name or its town, weighted by how rare each word is across all meetings, and the
meeting falls on the day and in the time of day the group's name gives. Candidates are returned one per address.

Standard library only. Tests: python3 -I -m unittest discover -s scripts/group-data
"""
import collections
import math
import re
from typing import NamedTuple, Optional, Tuple

DAYS = {'sunday': 0, 'sun': 0, 'monday': 1, 'mon': 1, 'tuesday': 2, 'tue': 2, 'tues': 2, 'wednesday': 3, 'wed': 3,
        'thursday': 4, 'thu': 4, 'thur': 4, 'thurs': 4, 'friday': 5, 'fri': 5, 'saturday': 6, 'sat': 6}
# Word -> the hours (24-hour clock, inclusive) a meeting must start in.
TIME_WORDS = {'noon': (11, 14), 'noontime': (11, 14), 'lunch': (11, 14), 'morning': (4, 11), 'sunrise': (4, 10), 'dawn': (4, 9),
              'afternoon': (12, 17), 'evening': (17, 22), 'night': (17, 24), 'nite': (17, 24), 'midnight': (21, 24)}
# Words that say nothing about which meeting this is.
GENERIC = {'group', 'gp', 'meeting', 'the', 'aa', 'a', 'of', 'and', 'step', 'steps', 'in', 'at', 'hybrid', 'virtual', 'on', 'for', 'to', 'we', 'our'}

MIN_COVER = 0.6  # share of the group's (rarity-weighted) place words a meeting must account for
MIN_RARE = 2.5  # at least one matched word must be at least this rare (natural-log scale)
NAME_WEIGHT, PLACE_WEIGHT = 1.0, 0.8  # a word in the meeting's name counts more than one in its location or town


def words(text: str) -> list:
    return re.sub(r"[^a-z0-9 ]", ' ', text.lower()).split()


class Signals(NamedTuple):
    tokens: set  # place words: what is left after generic, day and time words are removed
    day: Optional[int]  # 0 is Sunday
    hours: Optional[Tuple[int, int]]


def name_signals(name: str) -> Signals:
    ws = words(name)
    day = next((DAYS[w] for w in ws if w in DAYS), None)
    hours = next((TIME_WORDS[w] for w in ws if w in TIME_WORDS), None)
    tokens = {w for w in ws if w not in GENERIC and w not in DAYS and w not in TIME_WORDS}
    return Signals(tokens, day, hours)


def _hour(hm: str) -> float:
    h, m = hm.split(':')
    return int(h) + int(m) / 60


class Index:
    """Meetings with the word statistics needed to weigh a match. Each meeting is a dict with name, location, town, when and addr."""

    def __init__(self, meetings):
        self.meetings = meetings
        self.name_words = [{w for w in words(m['name']) if w not in GENERIC} for m in meetings]
        self.place_words = [{w for w in words(f"{m['location']} {m['town']}") if w not in GENERIC} for m in meetings]
        self.doc_freq = collections.Counter()
        for n, p in zip(self.name_words, self.place_words):
            self.doc_freq.update(n | p)

    def rarity(self, word: str) -> float:
        return math.log((len(self.meetings) + 1) / (self.doc_freq[word] + 1))


def find_candidates(index: Index, name: str) -> list:
    """One entry per address: the first matching meeting there, plus `whens`, the (day, time) of every matching meeting."""
    signals = name_signals(name)
    if not signals.tokens:
        return []
    total = sum(index.rarity(t) for t in signals.tokens)
    # The rarest word in the name (the place or the unusual word) must be in the meeting: common words alone ("Women",
    # "Big Book") must not carry a match to a meeting that has nothing to do with the rest of the name.
    rarest = max(signals.tokens, key=index.rarity)
    found = {}
    for m, in_name, in_place in zip(index.meetings, index.name_words, index.place_words):
        when = m.get('when')
        if signals.day is not None and (when is None or when[0] != signals.day):
            continue
        if signals.hours is not None and (when is None or not signals.hours[0] <= _hour(when[1]) <= signals.hours[1]):
            continue
        hits = {t for t in signals.tokens if t in in_name or t in in_place}
        if rarest not in hits or index.rarity(rarest) < MIN_RARE:
            continue
        weight = sum(index.rarity(t) * (NAME_WEIGHT if t in in_name else PLACE_WEIGHT) for t in hits)
        if weight / total < MIN_COVER:
            continue
        entry = found.setdefault(m['addr'], dict(m, whens=set()))
        if when:
            entry['whens'].add(when)
    return list(found.values())
