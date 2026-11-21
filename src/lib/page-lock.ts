// Pinning the page while a modal is open (used by src/scripts/sheet.ts).
//
// `overflow: hidden` on the page is not enough on iOS Safari: a touch on anything that cannot scroll still scrolls the page
// behind. Fixing the body in place stops that, and the scroll position is put back afterwards. The risk is a lock that is
// never released, which leaves the whole page frozen. So the lock counts the sheets holding it (it is released only when the
// last one lets go), and `heal` frees it outright when the page is known to have no sheet open.

export interface PageLockDeps {
  body: { style: { position: string; top: string; inlineSize: string } };
  scrollY: () => number;
  scrollTo: (y: number) => void;
}

export interface PageLock {
  lock: () => void;
  unlock: () => void;
  /** Frees the page whatever the count says. For a page that should be free: no sheet is open. */
  heal: () => void;
}

export function createPageLock({ body, scrollY, scrollTo }: PageLockDeps): PageLock {
  let holders = 0;
  let savedY = 0;

  const release = () => {
    holders = 0;
    body.style.position = body.style.top = body.style.inlineSize = '';
    scrollTo(savedY);
  };

  return {
    lock() {
      if (holders++ > 0) return;
      savedY = scrollY();
      body.style.position = 'fixed';
      body.style.top = `${-savedY}px`;
      body.style.inlineSize = '100%';
    },
    unlock() {
      if (holders > 0 && --holders === 0) release();
    },
    heal() {
      if (holders > 0) release();
    },
  };
}
