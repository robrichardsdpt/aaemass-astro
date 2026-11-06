// Minimal GitHub OAuth proxy for Decap CMS, as a Cloudflare Worker.
// Secrets: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET. Var: ALLOWED_ORIGIN (the site's origin, no path).
const AUTHORIZE = 'https://github.com/login/oauth/authorize';
const TOKEN = 'https://github.com/login/oauth/access_token';

const html = (body, headers = {}) => new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } });

function page(status, payload, origin) {
  // Decap opens this in a popup and listens for the message below.
  return html(`<!doctype html><meta charset="utf-8"><script>
(function () {
  var allowed = ${JSON.stringify(origin)};
  function receive(e) {
    if (e.origin !== allowed) return;
    window.opener.postMessage('authorization:github:${status}:' + ${JSON.stringify(JSON.stringify(payload))}, e.origin);
    window.removeEventListener('message', receive, false);
    window.close();
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', allowed);
})();
</script>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const target = new URL(AUTHORIZE);
      target.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      target.searchParams.set('redirect_uri', `${url.origin}/callback`);
      target.searchParams.set('scope', url.searchParams.get('scope') || 'public_repo');
      target.searchParams.set('state', state);
      return new Response(null, {
        status: 302,
        headers: { Location: target.href, 'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600` },
      });
    }

    if (url.pathname === '/callback') {
      const state = url.searchParams.get('state');
      const cookie = (request.headers.get('Cookie') || '').match(/oauth_state=([^;]+)/)?.[1];
      const code = url.searchParams.get('code');
      if (!code || !state || state !== cookie) return page('error', { message: 'Invalid sign-in state. Please try again.' }, env.ALLOWED_ORIGIN);

      const res = await fetch(TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'decap-oauth-worker' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const data = await res.json();
      if (!data.access_token) return page('error', { message: data.error_description || 'GitHub did not return a token.' }, env.ALLOWED_ORIGIN);
      return page('success', { token: data.access_token, provider: 'github' }, env.ALLOWED_ORIGIN);
    }

    return new Response('Decap OAuth proxy', { status: 200 });
  },
};
