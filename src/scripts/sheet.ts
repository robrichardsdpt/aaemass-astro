// Shared behaviour for every modal window (any <dialog class="sheet">): the site search, the events window, the contribute form.
// On desktop a sheet is a centered window; on phones it is a bottom sheet. CSS (.sheet in global.css) does the layout and
// locks the page behind it. This file adds what CSS cannot:
//   - the one-shot entrance animation,
//   - closing when the dimmed backdrop is clicked (and only then: see lib/backdrop.ts),
//   - swipe down on the header to dismiss (phones),
//   - keeping the sheet inside the visible area while the on-screen keyboard is open (iOS Safari).
import { closesOnBackdrop, isOutside } from '../lib/backdrop';

/** True while sheets are bottom sheets (phones). Keep in step with the breakpoint in global.css. */
export const phoneSheet = matchMedia('(max-width: 39.99rem)');

const DISMISS_DISTANCE = 110;
const KEYBOARD_MIN_HEIGHT = 120;
const FIELDS = 'input, select, textarea';

/**
 * Pins the page where it is while a sheet is open. `overflow: hidden` on the page is not enough on iOS Safari: a touch on
 * anything that cannot scroll (a header, short results) still scrolls the page behind. Fixing the body in place stops that,
 * and the scroll position is put back when the sheet closes.
 */
function lockPage() {
  const body = document.body;
  const y = window.scrollY;
  body.style.position = 'fixed';
  body.style.top = `${-y}px`;
  body.style.inlineSize = '100%';
  return () => {
    body.style.position = body.style.top = body.style.inlineSize = '';
    window.scrollTo({ top: y, behavior: 'instant' }); // the page's smooth scrolling would otherwise animate back
  };
}

/**
 * On open: the one-shot entrance animation (tied to an attribute, not to [open], so it never replays when the layout
 * changes) and the page lock. On close: the page is released.
 */
function onOpenClose(dlg: HTMLDialogElement) {
  let unlock: (() => void) | undefined;
  new MutationObserver(() => {
    if (dlg.open && !unlock) {
      unlock = lockPage();
      dlg.dataset.opening = '';
      setTimeout(() => { delete dlg.dataset.opening; }, 400);
    } else if (!dlg.open && unlock) {
      unlock();
      unlock = undefined;
    }
  }).observe(dlg, { attributes: true, attributeFilter: ['open'] });
}

/** Dragging the header down dismisses the sheet; a short drag springs back. */
function dismissOnSwipe(dlg: HTMLDialogElement, bar: HTMLElement) {
  let start = 0;
  let dragged = 0;
  let dragging = false;
  const settle = () => { dlg.style.transform = ''; dlg.style.transition = ''; };
  bar.addEventListener('pointerdown', (e) => {
    if (!phoneSheet.matches || (e.target as HTMLElement).closest('button')) return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    dragging = true;
    start = e.clientY;
    dragged = 0;
    bar.setPointerCapture(e.pointerId);
    dlg.style.transition = 'none';
  });
  bar.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragged = Math.max(0, e.clientY - start);
    dlg.style.transform = `translateY(${dragged}px)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    dlg.style.transition = 'transform 180ms ease-out';
    if (dragged > DISMISS_DISTANCE) {
      dlg.style.transform = 'translateY(100%)';
      setTimeout(() => { dlg.close(); settle(); }, 180);
    } else {
      dlg.style.transform = '';
      setTimeout(settle, 180);
    }
  };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

// iOS Safari: the on-screen keyboard covers the page without resizing it, and Safari pans the visual viewport to reveal
// the focused field, reporting the new size only after the keyboard has finished animating. A bottom-anchored sheet sized
// with dvh therefore ends up behind the keyboard or pushed off screen. While the keyboard is open, the sheet is pinned
// to exactly what is visible (top and height from the visual viewport), re-checked every frame while the keyboard animates.
function followKeyboard(dlg: HTMLDialogElement) {
  const vv = window.visualViewport;
  if (!vv) return;
  let frame = 0;
  // Set when focus leaves the fields: the keyboard is on its way out, but iOS keeps reporting the shrunken viewport until
  // it has slid away. Without this the sheet would stay shrunk for that moment instead of expanding right away.
  let leaving = false;
  const isField = (t: EventTarget | null) => t instanceof HTMLElement && dlg.contains(t) && t.matches(FIELDS);

  function sync() {
    if (window.innerHeight - vv!.height <= KEYBOARD_MIN_HEIGHT) leaving = false;
    const keyboard = phoneSheet.matches && dlg.open && !leaving && window.innerHeight - vv!.height > KEYBOARD_MIN_HEIGHT;
    if (!keyboard) {
      delete dlg.dataset.kb;
      dlg.style.removeProperty('--sheet-top');
      dlg.style.removeProperty('--sheet-vh');
      return;
    }
    dlg.dataset.kb = '';
    dlg.style.setProperty('--sheet-top', `${Math.round(vv!.offsetTop)}px`);
    dlg.style.setProperty('--sheet-vh', `${Math.round(vv!.height)}px`);
    const active = document.activeElement;
    if (active instanceof HTMLElement && dlg.contains(active) && active.matches('input, select')) active.scrollIntoView({ block: 'nearest' });
  }
  function track(ms = 900) {
    cancelAnimationFrame(frame);
    const until = performance.now() + ms;
    const tick = () => {
      sync();
      if (performance.now() < until) frame = requestAnimationFrame(tick);
    };
    tick();
  }

  vv.addEventListener('resize', () => track(300));
  vv.addEventListener('scroll', sync);
  dlg.addEventListener('focusin', (e) => { if (isField(e.target)) leaving = false; track(); });
  dlg.addEventListener('focusout', (e) => {
    // Focus moving to another field keeps the keyboard up; anywhere else (or nowhere, as with Return) dismisses it.
    if (isField(e.target) && !isField((e as FocusEvent).relatedTarget)) leaving = true;
    track();
  });
  phoneSheet.addEventListener('change', sync);
  dlg.addEventListener('close', () => { cancelAnimationFrame(frame); sync(); });
}

/**
 * Clicking the dimmed backdrop closes the sheet, but only when the press and the release were both on the backdrop. A press
 * that starts inside the window (selecting text in a field) and lets go outside, or a click on empty space inside the
 * window, also reports the dialog as its target and must not close it.
 */
function closeOnBackdrop(dlg: HTMLDialogElement) {
  let pressedOutside = false;
  dlg.addEventListener('pointerdown', (e) => {
    pressedOutside = e.target === dlg && isOutside(dlg.getBoundingClientRect(), e.clientX, e.clientY);
  });
  dlg.addEventListener('click', (e) => {
    const box = dlg.getBoundingClientRect();
    if (closesOnBackdrop({ pressedOutside, onDialogItself: e.target === dlg, box, x: e.clientX, y: e.clientY })) dlg.close();
    pressedOutside = false;
  });
}

for (const dlg of document.querySelectorAll<HTMLDialogElement>('dialog.sheet')) {
  const bar = dlg.querySelector<HTMLElement>('.sheet__bar');
  onOpenClose(dlg);
  closeOnBackdrop(dlg);
  if (bar) dismissOnSwipe(dlg, bar);
  followKeyboard(dlg);
}
