// Dev-only: mint a valid cairn_session cookie value for smoke-testing the /admin guard.
// Does not use the email loop. Mirrors src/lib/cairn/auth.ts (HMAC-SHA256, b64url payload.sig).
// Reads SESSION_SECRET from .dev.vars. Usage: node scripts/mint-session.mjs
import { readFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const vars = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
// Strip optional surrounding quotes (wrangler does this when loading .dev.vars).
const secret = vars.match(/^SESSION_SECRET=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
if (!secret) throw new Error('SESSION_SECRET not found in .dev.vars');

const enc = new TextEncoder();
const b64url = (bytes) =>
  Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// Role defaults to editor; pass `owner` (argv[2]) to smoke-test the manage-admins gate.
const role = process.argv[2] === 'owner' ? 'owner' : 'editor';
const editor = { email: 'geoff-login@907.life', name: 'Geoff Wright', role, exp: Date.now() + 3600_000 };
const payload = b64url(enc.encode(JSON.stringify(editor)));
const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
process.stdout.write(`${payload}.${b64url(new Uint8Array(sig))}`);
