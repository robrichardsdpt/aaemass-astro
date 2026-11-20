// Group contribution form: the "Group name" field becomes a search over the Area 30 group list. Choosing a group fills
// in the group number and, where we are confident, the meeting address. Anything we are not sure of is offered, never
// forced, and every field stays editable. If the list cannot be loaded the field is an ordinary text box.
import { addressLine, addressPlan, clock, groupLabel, groupNumber, meetingPlan, searchGroups, type GroupEntry, type GroupMeeting, type GroupOption } from '../lib/group-lookup';

const AUTO = 'autofilled';

function attach(form: HTMLFormElement) {
  const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement | null;
  const name = field('group');
  const number = field('number');
  const address = [field('street'), field('town'), field('zip')];
  const day = form.elements.namedItem('day') as HTMLSelectElement | null; // first option is the "Choose…" placeholder
  const time = field('time');
  const url = form.dataset.groupLookup;
  if (!name || !number || !url) return;
  const say = (key: string) => form.dataset[`gl${key}`] ?? '';

  let list: Promise<GroupEntry[]> | null = null;
  const load = () => {
    list ??= fetch(url, { credentials: 'omit' })
      .then((r) => (r.ok ? (r.json() as Promise<GroupEntry[]>) : Promise.reject(new Error('group list unavailable'))))
      .catch(() => {
        list = null; // try again next time; meanwhile the field works as plain text
        return [] as GroupEntry[];
      });
    return list;
  };

  const box = name.closest('.field') as HTMLElement;
  const listId = `${name.id}-results`;
  const results = Object.assign(document.createElement('ul'), { id: listId, className: 'lookup-results', hidden: true });
  results.setAttribute('role', 'listbox');
  const live = Object.assign(document.createElement('p'), { className: 'visually-hidden' });
  live.setAttribute('role', 'status');
  const panel = Object.assign(document.createElement('div'), { className: 'lookup-panel', hidden: true });
  // The input and its list share a wrapper so the list can hang directly under the input, whatever the label and hint do.
  const wrap = Object.assign(document.createElement('div'), { className: 'lookup-wrap' });
  name.before(wrap);
  wrap.append(name, results);
  box.append(live, panel);
  name.setAttribute('role', 'combobox');
  name.setAttribute('aria-autocomplete', 'list');
  name.setAttribute('aria-controls', listId);
  name.setAttribute('aria-expanded', 'false');
  name.autocomplete = 'off';

  let shown: GroupEntry[] = [];
  let active = -1;
  let choose: (g: GroupEntry) => void = () => {}; // set below; the result list needs it before it is defined

  const close = () => {
    results.hidden = true;
    name.setAttribute('aria-expanded', 'false');
    name.removeAttribute('aria-activedescendant');
    active = -1;
  };
  const highlight = (i: number) => {
    active = i;
    [...results.children].forEach((li, n) => li.setAttribute('aria-selected', String(n === i)));
    if (i >= 0) name.setAttribute('aria-activedescendant', `${listId}-${i}`);
    else name.removeAttribute('aria-activedescendant');
  };
  const render = (found: GroupEntry[]) => {
    shown = found;
    results.replaceChildren(
      ...found.map((g, i) => {
        const li = document.createElement('li');
        li.id = `${listId}-${i}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.textContent = groupLabel(g);
        li.addEventListener('mousedown', (e) => {
          e.preventDefault(); // keep focus in the field so the list does not close before the click lands
          choose(g);
        });
        return li;
      }),
    );
    results.hidden = found.length === 0;
    name.setAttribute('aria-expanded', String(found.length > 0));
    active = -1;
    live.textContent = found.length ? say('Found').replace('{n}', String(found.length)) : name.value.trim() ? say('None') : '';
  };

  // Fields we filled in ourselves are marked, so a later choice can replace them without touching what the person typed.
  const put = (el: HTMLInputElement | null, value: string, force: boolean) => {
    if (!el || (!force && el.value !== '' && el.dataset[AUTO] !== '1')) return;
    el.value = value;
    el.dataset[AUTO] = '1';
  };
  const managed = [number, ...address, day, time];
  const clearAuto = () => {
    for (const el of managed) {
      if (el && el.dataset[AUTO] === '1') {
        el.value = '';
        delete el.dataset[AUTO];
      }
    }
  };
  for (const el of managed) for (const type of ['input', 'change']) el?.addEventListener(type, () => delete el.dataset[AUTO]);

  const fillAddress = (o: GroupOption, force: boolean) => {
    put(address[0], o.street, force);
    put(address[1], o.town, force);
    if (o.zip) put(address[2], o.zip, force);
  };
  const dayName = (i: number) => day?.options[i + 1]?.text ?? '';
  const fillMeeting = (m: GroupMeeting, force: boolean) => {
    if (day && day.options.length > m.day + 1 && (force || day.value === '' || day.dataset[AUTO] === '1')) {
      day.selectedIndex = m.day + 1;
      day.dataset[AUTO] = '1';
    }
    put(time, m.time, force);
  };
  const text = (s: string) => Object.assign(document.createElement('p'), { textContent: s });
  // A group with no number gets a note above whatever else the panel shows: the number is for the person to enter.
  let lead: Node[] = [];
  const showPanel = (...nodes: Node[]) => {
    panel.replaceChildren(...lead, ...nodes);
    panel.hidden = lead.length + nodes.length === 0;
  };
  const button = (label: string, onClick: () => void) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'button button--quiet', textContent: label });
    b.addEventListener('click', onClick);
    return b;
  };
  // After an address is in place: fill the day and time if there is one meeting, or ask which one.
  const showFilled = (o: GroupOption, force: boolean) => {
    const plan = meetingPlan(o);
    const done = () => showPanel(text(say('Filled')));
    if (plan.mode === 'fill') fillMeeting(plan.meeting, force);
    if (plan.mode === 'choose') {
      const pick = (m: GroupMeeting) => button(`${dayName(m.day)} ${clock(m.time)}`.trim(), () => {
        fillMeeting(m, true);
        done();
      });
      showPanel(text(say('Filled')), text(say('When')), ...plan.meetings.map(pick));
    } else {
      done();
    }
    live.textContent = say('Filled');
  };
  const accept = (o: GroupOption) => {
    fillAddress(o, true);
    showFilled(o, true);
  };

  choose = (g: GroupEntry) => {
    name.value = g.name;
    close();
    clearAuto();
    lead = g.id ? [] : [text(say('Numberhelp'))];
    if (g.id) put(number, groupNumber(g), true);
    const plan = addressPlan(g);
    if (plan.mode === 'fill') {
      fillAddress(plan.option, false);
      showFilled(plan.option, false);
    } else if (plan.mode === 'offer') {
      showPanel(text(say('Offer').replace('{address}', addressLine(plan.option))), button(say('Use'), () => accept(plan.option)));
    } else if (plan.mode === 'choose') {
      showPanel(text(say('Choose')), ...plan.options.map((o) => button(addressLine(o), () => accept(o))));
    } else {
      showPanel();
    }
  };

  name.addEventListener('input', async () => {
    lead = [];
    showPanel(); // an earlier suggestion no longer applies once the name is edited
    const groups = await load();
    render(searchGroups(groups, name.value));
  });
  name.addEventListener('focus', () => void load());
  name.addEventListener('blur', close);
  name.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return close();
    if (results.hidden || shown.length === 0) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      highlight((active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      choose(shown[active]);
    }
  });
}

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-group-lookup]')) attach(form);
