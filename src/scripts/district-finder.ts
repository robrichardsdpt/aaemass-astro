// The "Find your district by town" box on the Districts page. Everything is already on the page (the towns are in a JSON block and
// each district's card lists its own towns), so this only adds the shortcut: type a town, get its district and a link to the card.
// Without JavaScript the box stays hidden and the towns can still be read on each card.
import { searchTowns, type TownEntry } from '../lib/town-finder';

type FinderData = { towns: [string, number[]][]; districts: Record<string, { id: string; label: string }> };

const box = document.getElementById('d-finder');
const dataEl = document.getElementById('df-data');
const input = document.getElementById('df-q') as HTMLInputElement | null;
const list = document.getElementById('df-results');
const none = document.getElementById('df-none');
const status = document.getElementById('df-status');

if (box && dataEl && input && list && none && status) {
  const data = JSON.parse(dataEl.textContent || '{"towns":[],"districts":{}}') as FinderData;
  const entries: TownEntry[] = data.towns.map(([town, districts]) => ({ town, districts }));
  const countText = box.dataset.count ?? '';
  const orText = box.dataset.or ?? '';

  const row = (entry: TownEntry) => {
    const li = document.createElement('li');
    const town = Object.assign(document.createElement('strong'), { className: 'd-finder__town', textContent: entry.town });
    const arrow = Object.assign(document.createElement('span'), { className: 'd-finder__arrow', textContent: '→' });
    arrow.setAttribute('aria-hidden', 'true');
    li.append(town, arrow);
    entry.districts.forEach((n, i) => {
      const d = data.districts[n];
      if (i > 0) li.append(` ${orText} `);
      li.append(Object.assign(document.createElement('a'), { href: `#${d.id}`, textContent: d.label }));
    });
    return li;
  };

  input.addEventListener('input', () => {
    const typed = input.value.trim();
    const found = searchTowns(entries, typed);
    list.replaceChildren(...found.map(row));
    list.hidden = found.length === 0;
    none.hidden = found.length > 0 || typed === '';
    status.textContent = found.length ? countText.replace('{n}', String(found.length)) : '';
  });

  // A card hidden by the "Find a district" search above the cards would make the link go nowhere, so that search is cleared first.
  list.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('a')) return;
    const cardSearch = document.getElementById('d-q') as HTMLInputElement | null;
    if (cardSearch?.value) {
      cardSearch.value = '';
      cardSearch.dispatchEvent(new Event('input'));
    }
  });

  box.hidden = false;
}
