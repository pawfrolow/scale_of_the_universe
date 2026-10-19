import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fitItemToViewport } from '../src/helpers/fitItemToViewport.ts';

const viewport = { x: 24, y: 80, width: 1232, height: 560 };
const origin = { x: 640, y: 360 };
const fit = (bounds, options = {}) => fitItemToViewport({ bounds, viewport, origin, preferredScale: 1, descriptionFontSize: 32, cssPixelsPerUnit: 1, ...options });
const inside = (result, bounds) => {
  assert.ok(result.x + bounds.x * result.scale >= viewport.x - 1e-8);
  assert.ok(result.y + bounds.y * result.scale >= viewport.y - 1e-8);
  assert.ok(result.x + (bounds.x + bounds.width) * result.scale <= viewport.x + viewport.width + 1e-8);
  assert.ok(result.y + (bounds.y + bounds.height) * result.scale <= viewport.y + viewport.height + 1e-8);
};

test('preserves scale and origin when already inside', () => {
  assert.deepEqual(fit({ x: -100, y: -100, width: 200, height: 200 }), { scale: 1, x: 640, y: 360, useModal: false });
});
for (const [edge, x, y] of [['left', -800, 0], ['right', 600, 0], ['top', 0, -500], ['bottom', 0, 400]]) {
  test(`moves inward at ${edge} without shrinking`, () => {
    const bounds = { x, y, width: 200, height: 100 };
    const result = fit(bounds);
    assert.equal(result.scale, 1);
    assert.equal(result.useModal, false);
    inside(result, bounds);
  });
}
test('fits width and height together, never enlarges', () => {
  for (const bounds of [{ x: -800, y: -200, width: 1800, height: 600 }, { x: 0, y: -400, width: 700, height: 1000 }]) {
    const result = fit(bounds);
    assert.ok(result.scale < 1);
    assert.equal(result.useModal, false);
    inside(result, bounds);
  }
  assert.equal(fit({ x: 0, y: 0, width: 10, height: 10 }, { preferredScale: 0.6 }).scale, 0.6);
});
test('uses modal below 10 CSS px, including description scale and canvas CSS scale', () => {
  const bounds = { x: 0, y: 0, width: 100, height: 100 };
  assert.equal(fit(bounds, { preferredScale: 0.3125 }).useModal, false);
  assert.equal(fit(bounds, { preferredScale: 0.3124 }).useModal, true);
  assert.equal(fit(bounds, { preferredScale: 0.5, descriptionFontSize: 20 }).useModal, false);
  assert.equal(fit(bounds, { preferredScale: 0.499, descriptionFontSize: 20 }).useModal, true);
  assert.equal(fit(bounds, { preferredScale: 0.6, cssPixelsPerUnit: 0.5 }).useModal, true);
  assert.equal(fit({ ...bounds, height: 2000 }).useModal, true);
});
test('invalid or empty geometry falls back to modal with finite output', () => {
  for (const bounds of [{ x: NaN, y: 0, width: 1, height: 1 }, { x: 0, y: 0, width: 0, height: 0 }]) {
    const result = fit(bounds);
    assert.equal(result.useModal, true);
    assert.ok(Number.isFinite(result.scale));
  }
  assert.equal(fit({ x: 0, y: 0, width: 10, height: 10 }, { viewport: { ...viewport, height: -1 } }).useModal, true);
});
