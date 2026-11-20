"""Tests for matching.py. Run: python3 -I -m unittest discover -s scripts/group-data"""
import unittest

from matching import Index, find_candidates, name_signals


def meeting(name, location, street, town, day, time):
    return dict(name=name, location=location, street=street, town=town, when=(day, time), addr=(street.lower(), town.lower()))


# A small made-up neighbourhood: two Copley meetings on Friday, one on Monday, plus filler so words have realistic rarity.
MEETINGS = [
    meeting('Copley Noontime', 'Trinity Church', '206 Clarendon St', 'Boston', 5, '12:00'),
    meeting('Copley Square', 'Old South Church', '645 Boylston St', 'Boston', 5, '17:30'),
    meeting('Copley Monday', 'Old South Church', '645 Boylston St', 'Boston', 1, '18:00'),
    meeting('Sober Swans Women', 'Congregational Church', '12 Concord Rd', 'Acton', 2, '19:30'),
    meeting('Sunday AM', 'Community Center', '162 W Union St', 'Ashland', 0, '09:00'),
    meeting('Sunday AM', 'Town Hall', '1 Main St', 'Hopkinton', 0, '09:00'),
    meeting('Sunday AM', 'Library', '2 Main St', 'Milford', 0, '09:00'),
    meeting('Serenity', 'Church', '1 A St', 'Natick', 3, '19:00'),
    meeting('Serenity', 'Church', '2 B St', 'Newton', 3, '19:00'),
    meeting('Serenity', 'Church', '3 C St', 'Quincy', 3, '19:00'),
    meeting('Beginners', 'Hall', '4 D St', 'Salem', 4, '19:00'),
    meeting('Beginners', 'Hall', '5 E St', 'Lynn', 4, '19:00'),
] + [meeting(f'Filler {i}', 'Hall', f'{i} F St', 'Town', 6, '10:00') for i in range(40)]
INDEX = Index(MEETINGS)


def streets(name):
    return sorted(c['street'] for c in find_candidates(INDEX, name))


class NameSignals(unittest.TestCase):
    def test_day_and_time_words_are_pulled_out_of_the_name(self):
        s = name_signals('Westwood Sunday Night Group')
        self.assertEqual(s.tokens, {'westwood'})
        self.assertEqual(s.day, 0)
        self.assertEqual(s.hours, (17, 24))

    def test_abbreviated_days_count_too(self):
        self.assertEqual(name_signals('Pocasset Sun Night Gp').day, 0)
        self.assertEqual(name_signals('Wed Wake Up Group').day, 3)

    def test_a_name_with_no_day_or_time_has_neither(self):
        s = name_signals('Needham On Time Group')
        self.assertIsNone(s.day)
        self.assertIsNone(s.hours)


class FindCandidates(unittest.TestCase):
    def test_a_place_word_and_a_day_find_the_meetings_on_that_day(self):
        self.assertEqual(streets('Copley Friday Group'), ['206 Clarendon St', '645 Boylston St'])

    def test_the_day_in_the_name_rules_out_other_days(self):
        self.assertEqual(streets('Copley Monday Group'), ['645 Boylston St'])
        self.assertEqual(streets('Copley Sunday Group'), [])

    def test_a_time_word_rules_out_meetings_at_other_times(self):
        self.assertEqual(streets('Copley Friday Noon Group'), ['206 Clarendon St'])
        self.assertEqual(streets('Copley Friday Night Group'), ['645 Boylston St'])

    def test_the_location_name_counts_as_well_as_the_meeting_name(self):
        self.assertEqual(streets('Trinity Group'), ['206 Clarendon St'])

    def test_the_town_counts_too(self):
        self.assertEqual(streets('Acton Women Group'), ['12 Concord Rd'])

    def test_one_address_is_returned_once_with_all_its_meetings(self):
        found = find_candidates(INDEX, 'Copley Group')
        old_south = next(c for c in found if c['street'] == '645 Boylston St')
        self.assertEqual(sorted(old_south['whens']), [(1, '18:00'), (5, '17:30')])

    def test_the_day_in_the_name_limits_which_meetings_are_listed_at_an_address(self):
        found = find_candidates(INDEX, 'Copley Friday Group')
        old_south = next(c for c in found if c['street'] == '645 Boylston St')
        self.assertEqual(sorted(old_south['whens']), [(5, '17:30')])

    def test_a_name_with_only_common_words_matches_nothing_useful(self):
        # "Group" and "Meeting" carry no information, and "Serenity" appears at too many places to point anywhere.
        self.assertEqual(streets('Group'), [])

    def test_a_name_that_shares_only_one_of_several_distinctive_words_does_not_match(self):
        self.assertEqual(streets('Sober Quartz Mountain Group'), [])

    def test_the_most_distinctive_word_in_the_name_must_appear_in_the_meeting(self):
        # "Women" and "Swans" match the Acton meeting, but "Mattapoisett", the rarest word, matches nothing.
        self.assertEqual(streets('Acton Sober Swans Group'), ['12 Concord Rd'])
        self.assertEqual(streets('Mattapoisett Sober Swans Women Group'), [])

    def test_unrelated_names_match_nothing(self):
        self.assertEqual(streets('Quartz Mountain Group'), [])


if __name__ == '__main__':
    unittest.main()
