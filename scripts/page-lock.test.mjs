// node --test scripts/page-lock.test.mjs : pinning the page while a modal is open, and never leaving it stuck.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageLock } from '../src/lib/page-lock.ts';

function setup(scrollY = 420) {
  const body = { style: { position: '', top: '', inlineSize: '' } };
  const scrolls = [];
  const lock = createPageLock({ body, scrollY: () => scrollY, scrollTo: (y) => scrolls.push(y) });
  return { body, scrolls, lock };
}

test('locking pins the body where it is and remembers the scroll position', () => {
  const { body, lock } = setup(420);
  lock.lock();
  assert.deepEqual(body.style, { position: 'fixed', top: '-420px', inlineSize: '100%' });
});

test('unlocking frees the body and puts the page back where it was', () => {
  const { body, scrolls, lock } = setup(420);
  lock.lock();
  lock.unlock();
  assert.deepEqual(body.style, { position: '', top: '', inlineSize: '' });
  assert.deepEqual(scrolls, [420]);
});

test('with two sheets holding the lock, the page stays pinned until the last one lets go', () => {
  const { body, scrolls, lock } = setup();
  lock.lock();
  lock.lock();
  lock.unlock();
  assert.equal(body.style.position, 'fixed');
  assert.deepEqual(scrolls, []);
  lock.unlock();
  assert.equal(body.style.position, '');
  assert.deepEqual(scrolls, [420]);
});

test('unlocking when nothing is locked does nothing', () => {
  const { body, scrolls, lock } = setup();
  lock.unlock();
  assert.deepEqual(body.style, { position: '', top: '', inlineSize: '' });
  assert.deepEqual(scrolls, []);
});

test('a second lock does not overwrite the remembered scroll position', () => {
  let y = 100;
  const body = { style: { position: '', top: '', inlineSize: '' } };
  const scrolls = [];
  const lock = createPageLock({ body, scrollY: () => y, scrollTo: (to) => scrolls.push(to) });
  lock.lock();
  y = 0; // a pinned page reports no scroll
  lock.lock();
  lock.unlock();
  lock.unlock();
  assert.deepEqual(scrolls, [100]);
});

test('healing frees a lock that is still held, however many sheets claimed it', () => {
  const { body, scrolls, lock } = setup();
  lock.lock();
  lock.lock();
  lock.heal();
  assert.deepEqual(body.style, { position: '', top: '', inlineSize: '' });
  assert.deepEqual(scrolls, [420]);
  lock.unlock(); // a late close after healing must not unbalance anything
  assert.deepEqual(scrolls, [420]);
});

test('healing a page that is not locked does nothing', () => {
  const { scrolls, lock } = setup();
  lock.heal();
  assert.deepEqual(scrolls, []);
});

test('the page can be locked again after it was healed', () => {
  const { body, lock } = setup(250);
  lock.lock();
  lock.heal();
  lock.lock();
  assert.equal(body.style.top, '-250px');
});
