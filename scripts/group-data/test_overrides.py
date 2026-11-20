"""Tests for overrides.py. Run: python3 -I -m unittest discover -s scripts/group-data"""
import copy
import unittest

from overrides import apply_overrides

OLD_SOUTH = dict(place='Old South Church', street='645 Boylston St', town='Boston', zip='02116', meetings=[dict(day=5, time='17:30')])


def groups():
    return [
        dict(id='000336495', name='Copley Friday Group', district='District 12,13', address='choose',
             options=[dict(place='Trinity Church', street='206 Clarendon St', town='Boston', zip='02116', meetings=[dict(day=5, time='12:00')]), OLD_SOUTH]),
        dict(id='000000001', name='Other Group', district='District 01', address='none', options=[]),
    ]


def override(**changes):
    return {'000336495': dict(name='Copley Friday Group', address='prefill', options=[OLD_SOUTH], **changes)}


class ApplyOverrides(unittest.TestCase):
    def test_an_override_replaces_the_address_level_and_the_options(self):
        result = apply_overrides(groups(), override())
        copley = result[0]
        self.assertEqual(copley['address'], 'prefill')
        self.assertEqual(copley['options'], [OLD_SOUTH])

    def test_other_groups_are_left_alone(self):
        before = copy.deepcopy(groups()[1])
        self.assertEqual(apply_overrides(groups(), override())[1], before)

    def test_a_note_explaining_the_override_is_allowed_and_not_copied_into_the_data(self):
        copley = apply_overrides(groups(), override(why='Confirmed by the group'))[0]
        self.assertNotIn('why', copley)

    def test_an_override_for_a_group_that_is_not_in_the_list_is_an_error(self):
        with self.assertRaisesRegex(ValueError, 'not in the group list'):
            apply_overrides(groups(), {'000999999': dict(name='Gone Group', address='none', options=[])})

    def test_a_renamed_group_is_an_error_so_someone_looks_at_it(self):
        with self.assertRaisesRegex(ValueError, 'renamed'):
            apply_overrides(groups(), {'000336495': dict(name='Copley Friday Night Group', address='prefill', options=[OLD_SOUTH])})

    def test_an_unknown_address_level_is_an_error(self):
        with self.assertRaisesRegex(ValueError, 'address level'):
            apply_overrides(groups(), {'000336495': dict(name='Copley Friday Group', address='sure', options=[OLD_SOUTH])})

    def test_prefill_and_offer_need_exactly_one_address(self):
        for level in ('prefill', 'offer'):
            with self.assertRaisesRegex(ValueError, 'exactly one'):
                apply_overrides(groups(), {'000336495': dict(name='Copley Friday Group', address=level, options=[])})
            with self.assertRaisesRegex(ValueError, 'exactly one'):
                apply_overrides(groups(), {'000336495': dict(name='Copley Friday Group', address=level, options=[OLD_SOUTH, OLD_SOUTH])})

    def test_a_bad_zip_day_or_time_is_an_error(self):
        for bad in (dict(OLD_SOUTH, zip='2116'), dict(OLD_SOUTH, meetings=[dict(day=7, time='17:30')]), dict(OLD_SOUTH, meetings=[dict(day=5, time='5:30 pm')])):
            with self.assertRaises(ValueError):
                apply_overrides(groups(), {'000336495': dict(name='Copley Friday Group', address='prefill', options=[bad])})


if __name__ == '__main__':
    unittest.main()
