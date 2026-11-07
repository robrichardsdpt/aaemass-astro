// Sends every <form data-live-form> to the aa30-home WordPress plugin as JSON and reports the result in
// the form's own status line. Contribution forms get a PayPal URL back and the browser follows it.
const PAYPAL = new Set(['https://www.paypal.com', 'https://www.sandbox.paypal.com']);

function status(form: HTMLFormElement): HTMLElement {
  let el = form.querySelector<HTMLElement>('[data-status]');
  if (!el) {
    el = document.createElement('p');
    el.className = 'form-status';
    el.dataset.status = '';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    form.append(el);
  }
  return el;
}

function say(form: HTMLFormElement, text: string, state: 'ok' | 'error' | 'busy') {
  const el = status(form);
  el.textContent = text;
  el.dataset.state = state;
  el.hidden = false;
}

function collect(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};
  for (const [k, v] of new FormData(form)) if (typeof v === 'string') data[k] = v.trim();
  // Unchecked boxes are absent from FormData; checked ones arrive as their value.
  data._t = String(Math.round(performance.now()));
  return data;
}

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-live-form]')) {
  form.noValidate = true;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    for (const f of form.querySelectorAll('[aria-invalid]')) f.removeAttribute('aria-invalid');
    if (!form.checkValidity()) {
      const bad = form.querySelector<HTMLElement>(':invalid');
      bad?.setAttribute('aria-invalid', 'true');
      bad?.focus();
      say(form, form.dataset.invalid || 'Please check the form.', 'error');
      return;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (button) button.disabled = true;
    say(form, form.dataset.sending || 'Sending…', 'busy');
    try {
      const res = await fetch(`${form.dataset.endpoint}/${form.dataset.kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(collect(form)),
        credentials: 'omit',
      });
      const out = await res.json().catch(() => ({}));
      if (out.redirect) {
        const url = new URL(String(out.redirect));
        if (url.protocol === 'https:' && PAYPAL.has(url.origin)) {
          say(form, form.dataset.redirecting || 'Taking you to PayPal…', 'busy');
          location.assign(url.href);
          return;
        }
        throw new Error('unexpected redirect');
      }
      if (res.ok && out.ok) {
        form.reset();
        say(form, form.dataset.ok || 'Thank you.', 'ok');
      } else if (out.errors && typeof out.errors === 'object') {
        for (const name of Object.keys(out.errors)) form.elements.namedItem(name) instanceof HTMLElement && (form.elements.namedItem(name) as HTMLElement).setAttribute('aria-invalid', 'true');
        (form.querySelector('[aria-invalid]') as HTMLElement | null)?.focus();
        say(form, form.dataset.invalid || 'Please check the form.', 'error');
      } else {
        say(form, form.dataset.error || 'Sorry, that did not go through.', 'error');
      }
    } catch {
      say(form, form.dataset.error || 'Sorry, that did not go through.', 'error');
    } finally {
      if (button) button.disabled = false;
    }
  });
}
