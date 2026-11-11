// DOM helpers shared by the search window and the fallback event view. Everything is built with createElement and
// textContent, never innerHTML, so event text from Google or WordPress can not inject markup.
import { googleCalendarUrl, icsFile, icsFileName, outlookCalendarUrl, paragraphs, TZ, type SearchEvent } from '../lib/event-model';

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  n.append(...kids);
  return n;
}

const ext = { target: '_blank', rel: 'noopener noreferrer' };

export function textBlocks(text: string): HTMLElement[] {
  return paragraphs(text).map((p) => {
    const kids: (Node | string)[] = [];
    for (const s of p) {
      if (s.href) kids.push(el('a', { href: s.href, ...ext }, s.t));
      else s.t.split('\n').forEach((line, i) => kids.push(...(i ? [el('br'), line] : [line])));
    }
    return el('p', {}, ...kids);
  });
}

export function downloadIcs(e: SearchEvent) {
  const url = URL.createObjectURL(new Blob([icsFile(e)], { type: 'text/calendar;charset=utf-8' }));
  const a = el('a', { href: url, download: icsFileName(e) });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function calendarLinks(e: SearchEvent): HTMLElement[] {
  const ics = el('button', { type: 'button', class: 'button button--quiet' }, 'Apple / other (.ics)');
  ics.addEventListener('click', () => downloadIcs(e));
  return [
    el('a', { class: 'button button--quiet', href: googleCalendarUrl(e), ...ext }, 'Google Calendar'),
    el('a', { class: 'button button--quiet', href: outlookCalendarUrl(e), ...ext }, 'Outlook'),
    ics,
  ];
}

export const htmlStrip = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';

const day = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric' });
const clock = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', minute: '2-digit' });
const weekday = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' });
export const shortDay = (iso: string) => day.format(new Date(iso));
export const shortWhen = (e: SearchEvent) => (e.allDay ? `${weekday.format(new Date(e.start))}, all day` : clock.format(new Date(e.start)));
