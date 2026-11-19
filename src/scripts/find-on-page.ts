export {};
// Highlights the words a visitor searched for when they arrive from the site search (the link carries ?q=words).
// Uses the browser's CSS Custom Highlight API, which marks text without changing the page. Browsers without it still
// land on the right section, just without the marks. Collapsed FAQ answers that contain a match are opened.
const params = new URLSearchParams(location.search);
const query = params.get('q');
const main = document.getElementById('main');

// Same folding as the search window: no accents, no capitals, one character in and one out.
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, ' ');
const terms = (query ? norm(query).split(' ').filter(Boolean) : []).slice(0, 8);
const registry = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights;

if (main && terms.length) {
  // Drop ?q= so a shared or bookmarked link is the clean address; the #section stays.
  history.replaceState(null, '', location.pathname + location.hash);
  const ranges: Range[] = [];
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const folded = ' ' + norm(node.textContent ?? '');
    for (const term of terms) {
      for (let at = folded.indexOf(' ' + term); at >= 0; at = folded.indexOf(' ' + term, at + 1)) {
        const end = folded.indexOf(' ', at + 1 + term.length);
        const range = new Range();
        range.setStart(node, at);
        range.setEnd(node, end < 0 ? folded.length - 1 : end - 1);
        ranges.push(range);
      }
    }
  }
  for (const r of ranges) for (let d = r.startContainer.parentElement?.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true;
  if (ranges.length && registry) {
    const Highlight = (window as unknown as { Highlight: new (...r: Range[]) => unknown }).Highlight;
    registry.set('site-search', new Highlight(...ranges));
  }
  // With no #section in the link, bring the first match into view. With one, the browser has already scrolled there
  // (or does so once the opened FAQ answers have settled), so re-apply it.
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  else ranges[0]?.startContainer.parentElement?.scrollIntoView({ block: 'center' });
}
