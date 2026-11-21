// node --test scripts/district-map-assign.test.mjs : which district each town on the map belongs to.
import test from 'node:test';
import assert from 'node:assert/strict';
import { assignMunicipalities } from '../src/lib/map/assign.ts';

const towns = ['Barnstable', 'Boston', 'Falmouth', 'Marlborough', 'Wellesley', 'Edgartown', 'Tisbury', 'Gosnold', 'Carlisle', 'Quincy'];

test('a town listed under one district is in that district', () => {
  const a = assignMunicipalities({ 14: ['Wellesley'] }, towns);
  assert.deepEqual(a.get('Wellesley'), { kind: 'solid', district: 14, alsoIn: [] });
});

test('a village stands for its town when the town itself is not listed', () => {
  const a = assignMunicipalities({ 8: ['Wollaston'] }, towns);
  assert.deepEqual(a.get('Quincy'), { kind: 'solid', district: 8, alsoIn: [] });
});

test('a town listed itself keeps that district, and a village in another district is noted', () => {
  const a = assignMunicipalities({ 1: ['Barnstable', 'Hyannis'], 2: ['Cotuit'] }, towns.concat('Cotuit'));
  assert.deepEqual(a.get('Barnstable'), { kind: 'solid', district: 1, alsoIn: [2] });
});

test('a town split between districts, such as Boston, shows every district it touches', () => {
  const a = assignMunicipalities({ 11: ['Dorchester'], 12: ['Boston', 'Roxbury'], 13: ['Boston', 'Charlestown'], 14: ['Allston'] }, towns);
  assert.deepEqual(a.get('Boston'), { kind: 'split', districts: [11, 12, 13, 14] });
});

test('Martha’s Vineyard stands for all of its towns, and Cuttyhunk for Gosnold', () => {
  const a = assignMunicipalities({ 2: ['Martha’s Vineyard', 'Cuttyhunk'] }, towns);
  assert.deepEqual(a.get('Edgartown'), { kind: 'solid', district: 2, alsoIn: [] });
  assert.deepEqual(a.get('Tisbury'), { kind: 'solid', district: 2, alsoIn: [] });
  assert.deepEqual(a.get('Gosnold'), { kind: 'solid', district: 2, alsoIn: [] });
});

test('a town nobody lists has no district', () => {
  const a = assignMunicipalities({ 14: ['Wellesley'] }, towns);
  assert.deepEqual(a.get('Carlisle'), { kind: 'none' });
});

test('names match whatever the case or the borough ending', () => {
  const a = assignMunicipalities({ 23: ['Marlboro'] }, towns.map((t) => t.toUpperCase()));
  assert.deepEqual(a.get('MARLBOROUGH'), { kind: 'solid', district: 23, alsoIn: [] });
});

test('every town on the map gets an answer', () => {
  assert.deepEqual([...assignMunicipalities({}, towns).keys()], towns);
});
