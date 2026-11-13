// Extras on the Districts page. Everything here is an enhancement: the cards already show the schedule, the next meeting
// date (worked out when the site was built), the Zoom details and a link to open Zoom without any of this.
import { dayLabel, nextMeeting } from '../lib/next-meeting';
import { districtIcs, type DistrictCalendar } from '../lib/district-ics';

type Data = DistrictCalendar & { name: string };
const tools = document.getElementById('d-tools')!;
const announce = document.getElementById('d-announce')!;
const noneMsg = document.getElementById('d-none')!;
const count = document.getElementById('d-count')!;
const input = document.getElementById('d-q') as HTMLInputElement;
const cards = [...document.querySelectorAll<HTMLElement>('.district')];
const data = new Map<string, Data>((JSON.parse(document.getElementById('d-data')!.textContent || '[]') as Data[]).map((d) => [d.id, d]));
const locale = tools.dataset.locale || 'en-US';
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

// The buttons only work with JavaScript, so they stay hidden until it is running.
document.querySelectorAll<HTMLElement>('[data-js]').forEach((el) => (el.hidden = false));

// "Next meeting" was worked out when the site was built (daily); correct it if the date has passed since.
for (const card of cards) {
  const d = data.get(card.id);
  const time = card.querySelector<HTMLTimeElement>('.d-next time');
  if (!d || !time || d.note) continue;
  const next = nextMeeting(d);
  time.dateTime = next.ymd;
  time.textContent = next.today ? tools.dataset.today! : dayLabel(next.ymd, locale);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // blocked or unavailable: the old way
  }
  try {
    const box = document.createElement('textarea');
    box.value = text;
    box.setAttribute('readonly', '');
    box.style.cssText = 'position:fixed;top:0;opacity:0';
    document.body.append(box);
    box.select();
    const ok = document.execCommand('copy');
    box.remove();
    return ok;
  } catch {
    return false;
  }
}

const timers = new WeakMap<HTMLElement, number>();
document.addEventListener('click', async (e) => {
  const target = e.target as HTMLElement;
  const copy = target.closest<HTMLButtonElement>('[data-copy]');
  if (copy) {
    if (!(await copyText(copy.dataset.copy!))) return;
    const original = copy.dataset.label || (copy.dataset.label = copy.textContent!);
    copy.textContent = tools.dataset.copiedLabel!;
    announce.textContent = fill(tools.dataset.copied!, { what: copy.dataset.what! });
    window.clearTimeout(timers.get(copy));
    timers.set(copy, window.setTimeout(() => { copy.textContent = original; }, 1600));
    return;
  }
  const cal = target.closest<HTMLButtonElement>('[data-cal]');
  if (cal) {
    const d = data.get(cal.dataset.cal!);
    if (!d) return;
    const url = URL.createObjectURL(new Blob([districtIcs(d)], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${d.id}-meeting.ics` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});

// ---- Find a district -----------------------------------------------------------------------------------------------
const plain = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
// Built the first time someone types, not while the page loads.
let index: { card: HTMLElement; text: string; numbers: string[] }[] | undefined;
const build = () =>
  cards.map((card) => ({
    card,
    text: ' ' + plain(card.textContent || '').replace(/\s+/g, ' '),
    numbers: (plain(card.querySelector('h3')?.textContent || '').match(/\d+/g) || []) as string[],
  }));

function filter() {
  const words = plain(input.value).split(/\s+/).filter(Boolean);
  let shown = 0;
  for (const { card, text, numbers } of (index ??= build())) {
    // A short number means "district 8", not every 8 in an address; longer numbers (a ZIP code) are searched in the whole card.
    const ok = words.every((w) => (/^\d{1,2}$/.test(w) ? numbers.includes(w) : text.includes(w)));
    card.hidden = !ok;
    if (ok) shown++;
  }
  noneMsg.hidden = shown > 0;
  count.textContent = words.length ? fill(tools.dataset.shown!, { n: shown, total: cards.length }) : '';
  announce.textContent = words.length ? count.textContent : '';
}
input.addEventListener('input', filter);
