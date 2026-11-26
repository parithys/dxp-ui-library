// Live-edit the library inside an application: rebuilds dist when src/ changes and copies it into the application's node_modules/dxp-ui/dist.
//
//   npm run dev:app                          # the sibling ../prototype
//   npm run dev:app -- ../some-app           # another application (a folder with node_modules/dxp-ui)
//   DXP_APP=../some-app npm run dev:app
//   npm run dev:app -- --once                # build and copy one time, then exit
//
// Why a copy and not `npm link` / `file:`: a symlinked package resolves its own react, so the app ends up with two copies of React. The installed
// package stays a real directory with no node_modules of its own, exactly as `npm run lib:install` leaves it. Run the application's own dev server as
// usual; it already scans node_modules/dxp-ui/dist for Tailwind utilities, so a CSS or component edit shows after the copy.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const once = args.includes('--once');
const given = args.find((a) => !a.startsWith('--')) ?? process.env.DXP_APP ?? '../prototype';
const app = path.resolve(root, given);
const target = path.join(app, 'node_modules', 'dxp-ui');
if (!existsSync(target)) {
  console.error(`No installed dxp-ui at ${target}. Run \`npm run lib:install\` in the application once, or pass the application's folder.`);
  process.exit(1);
}

function build() {
  const started = Date.now();
  for (const script of ['build:js', 'build:types', 'build:css']) {
    const r = spawnSync('npm', ['run', '--silent', script], { cwd: root, stdio: 'inherit' });
    if (r.status !== 0) {
      console.error(`${script} failed - the application keeps the last good build.`);
      return false;
    }
  }
  rmSync(path.join(target, 'dist'), { recursive: true, force: true });
  cpSync(path.join(root, 'dist'), path.join(target, 'dist'), { recursive: true });
  console.log(`dxp-ui -> ${path.relative(root, target)}/dist (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  return true;
}

const ok = build();
if (once) process.exit(ok ? 0 : 1);

let timer;
let running = false;
let again = false;
const run = () => {
  if (running) return void (again = true);
  running = true;
  build();
  running = false;
  if (again) {
    again = false;
    run();
  }
};
watch(path.join(root, 'src'), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(run, 300);
});
console.log(`Watching ${path.join(root, 'src')} - edit a component or src/styles/*.css; Ctrl-C to stop.`);
