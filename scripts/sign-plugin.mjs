// Signs and verifies the plugin zip, so the WordPress updater only installs code that came from the main branch.
//
//   node scripts/sign-plugin.mjs keygen                              new key pair: private key (PEM) on stdout, public key (base64) on stderr
//   PLUGIN_SIGNING_KEY=<pem> node scripts/sign-plugin.mjs sign   <zip> <version> <out.sig>
//   node scripts/sign-plugin.mjs verify <zip> <version> <sig>        checks against the public key in the plugin's updater.php
//
// What is signed is "aa30-home-plugin", the version and the SHA-256 of the zip. Binding the version means an old, validly
// signed zip can not be replayed as a newer release. The private key lives only in the GitHub environment "release", which
// only the main branch may use; the matching public key is in wp-plugin/aa30-home/includes/updater.php.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const message = (version, zipBytes) =>
  Buffer.from(`aa30-home-plugin\n${version}\n${crypto.createHash('sha256').update(zipBytes).digest('hex')}\n`);

export function keygen() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const raw = Buffer.from(publicKey.export({ format: 'jwk' }).x, 'base64url');
  return { privatePem: privateKey.export({ type: 'pkcs8', format: 'pem' }), publicB64: raw.toString('base64') };
}

export function sign(privatePem, version, zipBytes) {
  return crypto.sign(null, message(version, zipBytes), crypto.createPrivateKey(privatePem)).toString('base64');
}

export function verify(publicB64, version, zipBytes, sigB64) {
  const raw = Buffer.from(publicB64, 'base64');
  if (raw.length !== 32) throw new Error('the public key must be 32 bytes');
  // Wrap the raw key in the fixed DER prefix for an Ed25519 public key.
  const der = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), raw]);
  const key = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
  return crypto.verify(null, message(version, zipBytes), key, Buffer.from(sigB64, 'base64'));
}

/** The public key the plugin trusts, read from its updater so the two can never drift apart unnoticed. */
export function embeddedPublicKey(file = 'wp-plugin/aa30-home/includes/updater.php') {
  const m = fs.readFileSync(file, 'utf8').match(/AA30_UPDATE_PUBLIC_KEY',\s*'([A-Za-z0-9+/=]{44})'/);
  if (!m) throw new Error(`no AA30_UPDATE_PUBLIC_KEY found in ${file}`);
  return m[1];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, zip, version, third] = process.argv.slice(2);
  try {
    if (cmd === 'keygen') {
      const { privatePem, publicB64 } = keygen();
      process.stderr.write(`${publicB64}\n`);
      process.stdout.write(privatePem);
    } else if (cmd === 'sign') {
      if (!process.env.PLUGIN_SIGNING_KEY) throw new Error('PLUGIN_SIGNING_KEY is not set');
      if (!zip || !version || !third) throw new Error('usage: sign <zip> <version> <out.sig>');
      const sig = sign(process.env.PLUGIN_SIGNING_KEY, version, fs.readFileSync(zip));
      fs.writeFileSync(third, `${sig}\n`);
      console.log(`signed ${zip} as version ${version}`);
    } else if (cmd === 'verify') {
      if (!zip || !version || !third) throw new Error('usage: verify <zip> <version> <sig>');
      const ok = verify(embeddedPublicKey(), version, fs.readFileSync(zip), fs.readFileSync(third, 'utf8').trim());
      if (!ok) throw new Error('the signature does not match the public key in updater.php');
      console.log(`signature OK for version ${version}`);
    } else {
      throw new Error('use keygen, sign or verify');
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
