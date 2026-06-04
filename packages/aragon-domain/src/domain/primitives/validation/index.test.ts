import { zExtended } from './index';

describe('zExtended', () => {
  it('exports hexString as a function', () => {
    expect(typeof zExtended.hexString).toBe('function');
  });
});
