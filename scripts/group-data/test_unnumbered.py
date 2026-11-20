"""Tests for unnumbered.py. Run: python3 -I -m unittest discover -s scripts/group-data"""
import unittest

from unnumbered import clean_name, place_name, unnumbered_groups


def row(name, street, town, when, location='Hall', zip='', url=''):
    return dict(name=name, location=location, street=street, town=town, when=when, zip=zip, url=url)


def numbered(street, town, meetings, zip='02116'):
    """A numbered group (as in the final data) whose address and meetings come from the listings."""
    return dict(id='000000001', name='Numbered Group', district='District 01', address='prefill',
                options=[dict(street=street, town=town, zip=zip, place='Hall', meetings=[dict(day=d, time=t) for d, t in meetings])])


class CleanNames(unittest.TestCase):
    def test_hybrid_and_virtual_tags_are_dropped_from_names(self):
        self.assertEqual(clean_name('Sunrise Serenity (Hybrid)'), 'Sunrise Serenity')
        self.assertEqual(clean_name('Early Bird (Virtual) '), 'Early Bird')
        self.assertEqual(clean_name('Just For Today'), 'Just For Today')

    def test_the_how_to_attend_suffix_is_dropped_from_place_names(self):
        self.assertEqual(place_name('Old South Church In-person and Online'), 'Old South Church')
        self.assertEqual(place_name('Trinity Church'), 'Trinity Church')


class UnnumberedGroups(unittest.TestCase):
    def test_a_meeting_no_numbered_group_has_becomes_a_group_without_a_number(self):
        found = unnumbered_groups([row('Copley Noontime', '206 Clarendon St', 'Boston', (5, '12:00'), location='Trinity Church', zip='02116')], [])
        self.assertEqual(len(found), 1)
        g = found[0]
        self.assertEqual((g['id'], g['name'], g['district'], g['address']), ('', 'Copley Noontime', '', 'prefill'))
        self.assertEqual(g['options'], [dict(street='206 Clarendon St', town='Boston', zip='02116', place='Trinity Church', meetings=[dict(day=5, time='12:00')])])

    def test_a_meeting_a_numbered_group_already_has_is_not_listed_again(self):
        groups = [numbered('645 Boylston St', 'Boston', [(5, '17:30')])]
        self.assertEqual(unnumbered_groups([row('Copley Square', '645 Boylston St', 'Boston', (5, '17:30'))], groups), [])

    def test_street_and_town_are_compared_without_regard_to_case_or_a_trailing_period(self):
        groups = [numbered('645 BOYLSTON ST.', 'boston', [(5, '17:30')])]
        self.assertEqual(unnumbered_groups([row('Copley Square', '645 Boylston St', 'Boston', (5, '17:30'))], groups), [])

    def test_another_time_at_a_claimed_address_is_still_listed(self):
        groups = [numbered('645 Boylston St', 'Boston', [(5, '17:30')])]
        found = unnumbered_groups([row('Copley Sunday', '645 Boylston St', 'Boston', (0, '10:00'))], groups)
        self.assertEqual([g['name'] for g in found], ['Copley Sunday'])

    def test_meetings_with_the_same_name_and_address_merge_in_week_order(self):
        pool = [row('Big Book', '1 Main St', 'Natick', (3, '19:00')), row('Big Book', '1 Main St', 'Natick', (1, '19:00')), row('Big Book (Hybrid)', '1 Main St', 'Natick', (1, '19:00'))]
        found = unnumbered_groups(pool, [])
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]['options'][0]['meetings'], [dict(day=1, time='19:00'), dict(day=3, time='19:00')])

    def test_different_names_or_addresses_stay_separate(self):
        pool = [row('Big Book', '1 Main St', 'Natick', (1, '19:00')), row('Big Book', '2 Oak St', 'Natick', (1, '19:00')), row('Serenity', '1 Main St', 'Natick', (1, '19:00'))]
        self.assertEqual(len(unnumbered_groups(pool, [])), 3)

    def test_a_meeting_with_no_day_or_time_is_listed_with_no_meetings(self):
        found = unnumbered_groups([row('Early Risers', '3 Elm St', 'Acton', None)], [])
        self.assertEqual(found[0]['options'][0]['meetings'], [])

    def test_the_zip_comes_from_the_listing_then_the_lookup_then_a_numbered_group_at_the_same_address(self):
        own = row('A', '1 A St', 'Town', (1, '19:00'), zip='01111')
        looked_up = row('B', '2 B St', 'Town', (1, '19:00'), url='https://example.org/b')
        shared = row('C', '3 C St', 'Town', (1, '19:00'))
        unknown = row('D', '4 D St', 'Town', (1, '19:00'))
        groups = [numbered('3 C St', 'Town', [(2, '19:00')], zip='03333')]
        found = {g['name']: g['options'][0]['zip'] for g in unnumbered_groups([own, looked_up, shared, unknown], groups, {'https://example.org/b': '02222'})}
        self.assertEqual(found, {'A': '01111', 'B': '02222', 'C': '03333', 'D': ''})

    def test_a_zip_found_through_one_meeting_serves_every_meeting_at_that_address(self):
        pool = [row('Early', '9 Elm St', 'Acton', (1, '07:00'), url='https://example.org/early'), row('Late', '9 Elm St', 'Acton', (1, '20:00'), url='https://example.org/late')]
        found = unnumbered_groups(pool, [], {'https://example.org/early': '01720'})
        self.assertEqual([g['options'][0]['zip'] for g in found], ['01720', '01720'])

    def test_groups_are_listed_in_name_order(self):
        pool = [row('Zeta', '1 A St', 'Town', (1, '19:00')), row('Alpha', '2 B St', 'Town', (1, '19:00'))]
        self.assertEqual([g['name'] for g in unnumbered_groups(pool, [])], ['Alpha', 'Zeta'])


if __name__ == '__main__':
    unittest.main()
