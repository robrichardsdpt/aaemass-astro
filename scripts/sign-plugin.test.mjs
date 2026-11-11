// node scripts/sign-plugin.test.mjs : tests plugin signing (the PHP side is tested in wp-plugin/tests/run.php with a Node-made fixture).
import assert from 'node:assert/strict';
import { keygen, sign, verify, message, embeddedPublicKey } from './sign-plugin.mjs';

const { privatePem, publicB64 } = keygen();
const zip = Buffer.from('pretend this is a zip\x00\x01');
const sig = sign(privatePem, '2.0.19', zip);

assert.equal(Buffer.from(publicB64, 'base64').length, 32, 'the public key is 32 raw bytes');
assert.equal(Buffer.from(sig, 'base64').length, 64, 'the signature is 64 bytes');
assert.equal(verify(publicB64, '2.0.19', zip, sig), true, 'a signed package verifies');
assert.equal(verify(publicB64, '2.0.20', zip, sig), false, 'a different version does not (no replaying an old release as a new one)');
assert.equal(verify(publicB64, '2.0.19', Buffer.concat([zip, Buffer.from('x')]), sig), false, 'a changed package does not');
assert.equal(verify(keygen().publicB64, '2.0.19', zip, sig), false, 'another key does not');
assert.equal(verify(publicB64, '2.0.19', zip, Buffer.alloc(64).toString('base64')), false, 'a zeroed signature does not');
assert.throws(() => verify('AAAA', '2.0.19', zip, sig), /32 bytes/, 'a malformed public key is an error');
assert.match(message('1.2.3', zip).toString(), /^aa30-home-plugin\n1\.2\.3\n[0-9a-f]{64}\n$/, 'the signed message has the documented shape (the PHP verifier builds the same one)');

const embedded = embeddedPublicKey();
assert.equal(Buffer.from(embedded, 'base64').length, 32, 'the public key in updater.php is a valid 32-byte key');
assert.throws(() => embeddedPublicKey('package.json'), /no AA30_UPDATE_PUBLIC_KEY/, 'a file without the key is an error');
console.log('sign-plugin tests passed');
