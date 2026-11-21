// Test harness for the library: loads the library's TypeScript modules through Vite's SSR loader (no '@/' alias - the library imports
// relatively). No extra dependencies: the test runner is node:test and the DOM-free render checks use react-dom/server.
import { createServer } from 'vite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const store = new Map();
const mem = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => void store.set(k, String(v)), removeItem: (k) => void store.delete(k), clear: () => store.clear() };
globalThis.localStorage = mem;
globalThis.sessionStorage = { ...mem };
globalThis.window = globalThis.window ?? globalThis;

// node --test runs each file in its own process, and each starts its own Vite server; a private cache dir per process avoids races.
const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vfq-lib-vite-'));
process.on('exit', () => fs.rmSync(cacheDir, { recursive: true, force: true }));

let server;
export async function load(modulePath) {
  server ??= await createServer({ root: ROOT, cacheDir, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true } });
  return server.ssrLoadModule(modulePath);
}
export async function close() {
  await server?.close();
}
