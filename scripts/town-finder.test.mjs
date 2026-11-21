// node --test scripts/town-finder.test.mjs : finding which district a town is in.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTownEntries, searchTowns, townKey } from '../src/lib/town-finder.ts';

const entries = buildTownEntries({
  1: ['Dennis', 'Harwich Port', 'South Yarmouth'],
  6: ['Bridgewater', 'East Bridgewater', 'West Bridgewater'],
  12: ['Boston', 'Roxbury'],
  13: ['Boston', 'Charlestown'],
  23: ['Marlborough', 'Westborough', 'Natick'],
  25: ['East Brookfield', 'Westborough'],
});
const names = (found) => found.map((e) => e.town);

test('a town in two districts becomes one entry listing both, and entries are in name order', () => {
  const boston = entries.find((e) => e.town === 'Boston');
  assert.deepEqual(boston.districts, [12, 13]);
  assert.deepEqual(names(entries), [...names(entries)].sort((a, b) => a.localeCompare(b)));
});

test('the same name in two districts keeps one entry with both numbers in order', () => {
  assert.deepEqual(entries.find((e) => e.town === 'Westborough').districts, [23, 25]);
});

test('typing the start of a town finds it, ignoring case and accents', () => {
  assert.deepEqual(names(searchTowns(entries, 'nat')), ['Natick']);
  assert.deepEqual(names(searchTowns(entries, 'NATICK')), ['Natick']);
  assert.deepEqual(names(searchTowns(entries, 'Natíck')), ['Natick']);
});

test('typing a later word of a town name finds it, with towns that start with the word listed first', () => {
  assert.deepEqual(names(searchTowns(entries, 'bridgewater')), ['Bridgewater', 'East Bridgewater', 'West Bridgewater']);
});

test('several words must all start a word in the town name', () => {
  assert.deepEqual(names(searchTowns(entries, 'east br')), ['East Bridgewater', 'East Brookfield']);
  assert.deepEqual(names(searchTowns(entries, 'west br')), ['West Bridgewater']);
});

test('boro and borough are the same ending, whichever is typed, even half-typed', () => {
  for (const typed of ['marlboro', 'marlborough', 'marlborou', 'marlbor']) {
    assert.deepEqual(names(searchTowns(entries, typed)), ['Marlborough'], typed);
  }
  assert.deepEqual(names(searchTowns(entries, 'westboro')), ['Westborough']);
});

test('a village written as one word or two is found either way', () => {
  assert.deepEqual(names(searchTowns(entries, 'harwichport')), ['Harwich Port']);
  assert.deepEqual(names(searchTowns(entries, 'harwich port')), ['Harwich Port']);
  assert.deepEqual(names(searchTowns(entries, 'harwich')), ['Harwich Port']);
});

test('a blank search, or one that matches nothing, finds nothing', () => {
  assert.deepEqual(searchTowns(entries, '   '), []);
  assert.deepEqual(searchTowns(entries, 'zzzz'), []);
});

test('the number of results is capped', () => {
  assert.equal(searchTowns(entries, 'b', 2).length, 2);
});

test('the key used for matching drops accents, case, spaces and punctuation, and shortens borough', () => {
  assert.equal(townKey("Martha’s Vineyard"), 'marthasvineyard');
  assert.equal(townKey('Marlborough'), 'marlboro');
  assert.equal(townKey('Harwich Port'), 'harwichport');
});
