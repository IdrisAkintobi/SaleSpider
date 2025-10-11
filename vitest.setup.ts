import { beforeEach } from 'vitest';

beforeEach(() => {
  // Mock `releasePointerCapture` and `setPointerCapture` methods
  // which are not implemented in JSDOM
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
});