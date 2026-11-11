// Deletes Cloudflare Pages preview deployments that are no longer needed.
//
//   node scripts/cleanup-previews.mjs --pr 14                 delete every preview of draft #14 (branch alias "pr-14")
//   node scripts/cleanup-previews.mjs --sweep --open 5,7      delete previews of every draft EXCEPT those still open
//   add --dry-run to list what would be deleted
//
// Needs CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_PAGES_PROJECT. It only ever touches deployments in the
// Preview environment whose branch is "pr-<number>", never production and never a draft that is still open. --sweep
// refuses to run without an explicit --open list (it may be empty), so a failure to list open drafts can not delete everything.
import { fileURLToPath } from 'node:url';

const PR_BRANCH = /^pr-(\d+)$/;

/** The deployments that should be deleted: previews of "pr-N" drafts, restricted by the mode. */
export function selectDeployments(deployments, { pr, open }) {
  return deployments.filter((d) => {
    if ((d.environment ?? '').toLowerCase() !== 'preview') return false;
    const m = PR_BRANCH.exec(d.deployment_trigger?.metadata?.branch ?? '');
    if (!m) return false;
    const n = Number(m[1]);
    return pr !== undefined ? n === pr : !open.includes(n);
  });
}

export function parseArgs(argv) {
  const get = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : undefined);
  const out = { dryRun: argv.includes('--dry-run'), sweep: argv.includes('--sweep') };
  if (get('pr') !== undefined) {
    if (!/^\d+$/.test(get('pr'))) throw new Error('--pr needs a pull request number');
    out.pr = Number(get('pr'));
  }
  if (out.sweep) {
    const list = get('open');
    if (list === undefined) throw new Error('--sweep needs --open <comma-separated open pull request numbers> (it may be empty: --open "")');
    out.open = list.split(',').map((s) => s.trim()).filter(Boolean).map(Number);
    if (out.open.some(Number.isNaN)) throw new Error('--open must be numbers');
  }
  if (out.pr === undefined && !out.sweep) throw new Error('use --pr <number> or --sweep --open <numbers>');
  return out;
}

export async function run({ args, env, fetchImpl = fetch, log = console.log }) {
  const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_PAGES_PROJECT: project } = env;
  if (!token || !account || !project) throw new Error('CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_PAGES_PROJECT are required');
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/deployments`;
  const call = (method, url) => fetchImpl(url, { method, headers: { Authorization: `Bearer ${token}` } });

  const all = [];
  for (let page = 1; ; page++) {
    const res = await call('GET', `${base}?per_page=25&page=${page}`);
    if (!res.ok) throw new Error(`could not list deployments (${res.status})`);
    const body = await res.json();
    all.push(...(body.result ?? []));
    if ((body.result ?? []).length < 25) break;
  }
  const doomed = selectDeployments(all, { pr: args.pr, open: args.open });
  log(`${all.length} deployments, ${doomed.length} to delete${args.dryRun ? ' (dry run)' : ''}`);
  let deleted = 0;
  let failed = 0;
  for (const d of doomed) {
    const label = `${d.deployment_trigger.metadata.branch} ${d.id.slice(0, 8)}`;
    if (args.dryRun) {
      log(`  would delete ${label}`);
      continue;
    }
    // force: the newest deployment of a branch is aliased, and Cloudflare refuses to delete an aliased one otherwise
    const res = await call('DELETE', `${base}/${d.id}?force=true`);
    if (res.ok) {
      deleted++;
      log(`  deleted ${label}`);
    } else {
      failed++;
      log(`  FAILED ${label} (${res.status})`);
    }
  }
  log(`done: ${deleted} deleted, ${failed} failed`);
  return { deleted, failed, planned: doomed.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { failed } = await run({ args: parseArgs(process.argv.slice(2)), env: process.env });
    process.exit(failed ? 1 : 0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
