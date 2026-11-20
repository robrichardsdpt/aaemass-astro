// node --test scripts/backdrop.test.mjs : when a click on a modal window's dimmed backdrop should close it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isOutside, closesOnBackdrop } from '../src/lib/backdrop.ts';

const box = { left: 300, right: 980, top: 20, bottom: 590 };

test('a point inside the window, or on its edge, is not outside', () => {
  assert.equal(isOutside(box, 640, 300), false);
  assert.equal(isOutside(box, 300, 20), false);
  assert.equal(isOutside(box, 980, 590), false);
});

test('a point beyond any side of the window is outside', () => {
  assert.equal(isOutside(box, 299, 300), true);
  assert.equal(isOutside(box, 981, 300), true);
  assert.equal(isOutside(box, 640, 19), true);
  assert.equal(isOutside(box, 640, 591), true);
});

test('pressing and releasing on the backdrop closes the window', () => {
  assert.equal(closesOnBackdrop({ pressedOutside: true, onDialogItself: true, box, x: 100, y: 300 }), true);
});

test('pressing inside and releasing on the backdrop (selecting text, dragging out) keeps it open', () => {
  assert.equal(closesOnBackdrop({ pressedOutside: false, onDialogItself: true, box, x: 100, y: 300 }), false);
});

test('pressing on the backdrop and releasing inside keeps it open', () => {
  assert.equal(closesOnBackdrop({ pressedOutside: true, onDialogItself: true, box, x: 640, y: 300 }), false);
});

test('empty space inside the window, which targets the dialog itself, keeps it open', () => {
  assert.equal(closesOnBackdrop({ pressedOutside: false, onDialogItself: true, box, x: 640, y: 300 }), false);
  assert.equal(closesOnBackdrop({ pressedOutside: true, onDialogItself: true, box, x: 640, y: 300 }), false);
});

test('a click on something inside the window never closes it', () => {
  assert.equal(closesOnBackdrop({ pressedOutside: true, onDialogItself: false, box, x: 100, y: 300 }), false);
});
