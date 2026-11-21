// One New Prepaid journey for web and tablet: the device changes how steps are operated, never which steps there are.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { load, close } from './harness.mjs';

let lib;
before(async () => {
  lib = await load('/src/lib/deviceType.ts');
});
after(close);

test('device type: any touch point or a coarse pointer is a tablet, otherwise web', () => {
  assert.equal(lib.deviceTypeFrom({ maxTouchPoints: 0, coarsePointer: false }), 'web');
  assert.equal(lib.deviceTypeFrom({}), 'web');
  assert.equal(lib.deviceTypeFrom({ maxTouchPoints: 5 }), 'tablet');
  assert.equal(lib.deviceTypeFrom({ maxTouchPoints: 0, coarsePointer: true }), 'tablet');
});
