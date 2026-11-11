// node scripts/cleanup-previews.test.mjs : tests the preview cleanup against a fake Cloudflare (no network, no token).
import assert from 'node:assert/strict';
import { selectDeployments, parseArgs, run } from './cleanup-previews.mjs';

const dep = (id, branch, environment = 'preview') => ({ id, environment, deployment_trigger: { metadata: { branch } } });
const all = [dep('a1', 'pr-3'), dep('a2', 'pr-3'), dep('b1', 'pr-5'), dep('c1', 'pr-7'), dep('p1', 'main', 'production'), dep('p2', 'pr-9', 'production'), dep('x1', 'feature-x'), dep('n1', undefined)];
const ids = (l) => l.map((d) => d.id).sort();

assert.deepEqual(ids(selectDeployments(all, { pr: 3 })), ['a1', 'a2'], '--pr removes only that draft\'s previews');
assert.deepEqual(ids(selectDeployments(all, { open: [5, 7] })), ['a1', 'a2'], '--sweep keeps drafts that are still open');
assert.deepEqual(ids(selectDeployments(all, { open: [] })), ['a1', 'a2', 'b1', 'c1'], 'a sweep with nothing open removes every draft preview');
assert.ok(!ids(selectDeployments(all, { open: [] })).some((i) => ['p1', 'p2', 'x1', 'n1'].includes(i)), 'never touches production, other branches or deployments with no branch');

assert.deepEqual(parseArgs(['--pr', '14']), { dryRun: false, sweep: false, pr: 14 });
assert.deepEqual(parseArgs(['--sweep', '--open', '5, 7', '--dry-run']), { dryRun: true, sweep: true, open: [5, 7] });
assert.deepEqual(parseArgs(['--sweep', '--open', '']).open, [], 'an empty --open list is allowed');
assert.throws(() => parseArgs(['--sweep']), /needs --open/, 'a sweep without --open is refused (so a failed lookup can not delete everything)');
assert.throws(() => parseArgs([]), /use --pr/, 'no mode is refused');
assert.throws(() => parseArgs(['--pr', 'abc']), /number/, 'a bad pr number is refused');

// a fake Cloudflare with pagination (25 per page) and one deployment that refuses to be deleted
function fake(deployments, { failId } = {}) {
  const calls = [];
  const impl = async (url, init) => {
    const u = new URL(url);
    calls.push(`${init.method} ${u.pathname.split('/deployments')[1] || ''}${u.search}`);
    if (init.method === 'GET') {
      const page = Number(u.searchParams.get('page'));
      return { ok: true, status: 200, json: async () => ({ result: deployments.slice((page - 1) * 25, page * 25) }) };
    }
    const id = u.pathname.split('/').pop();
    return { ok: id !== failId, status: id === failId ? 409 : 200, json: async () => ({}) };
  };
  return { impl, calls };
}
const env = { CLOUDFLARE_API_TOKEN: 't', CLOUDFLARE_ACCOUNT_ID: 'a', CLOUDFLARE_PAGES_PROJECT: 'p' };
const quiet = () => {};

const many = Array.from({ length: 60 }, (_, i) => dep(`d${i}`, `pr-${i % 3 === 0 ? 1 : 2}`));
let f = fake(many);
let r = await run({ args: { pr: 1, dryRun: false }, env, fetchImpl: f.impl, log: quiet });
assert.equal(r.deleted, 20, 'reads every page of results (60 deployments across 3 pages) and deletes the draft\'s 20');
assert.equal(f.calls.filter((c) => c.startsWith('GET')).length, 3, 'three pages were read');
assert.ok(f.calls.filter((c) => c.startsWith('DELETE')).every((c) => c.endsWith('?force=true')), 'deletes with force (the newest deployment of a branch is aliased)');

f = fake(many);
r = await run({ args: { sweep: true, open: [1, 2], dryRun: false }, env, fetchImpl: f.impl, log: quiet });
assert.equal(r.planned, 0, 'nothing is deleted when every draft is still open');
assert.equal(f.calls.filter((c) => c.startsWith('DELETE')).length, 0);

f = fake(many);
r = await run({ args: { pr: 2, dryRun: true }, env, fetchImpl: f.impl, log: quiet });
assert.equal(r.planned, 40, 'dry run plans the 40 deployments of draft 2');
assert.equal(f.calls.filter((c) => c.startsWith('DELETE')).length, 0, 'and deletes none');

f = fake([dep('ok', 'pr-4'), dep('bad', 'pr-4')], { failId: 'bad' });
r = await run({ args: { pr: 4, dryRun: false }, env, fetchImpl: f.impl, log: quiet });
assert.deepEqual([r.deleted, r.failed], [1, 1], 'one failure is counted and the rest still deleted');
await assert.rejects(() => run({ args: { pr: 1 }, env: {}, fetchImpl: f.impl, log: quiet }), /required/, 'missing credentials are an error');
console.log('cleanup-previews tests passed');
