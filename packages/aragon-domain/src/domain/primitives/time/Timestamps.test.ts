import { earliest, latest } from './Timestamps';

describe('Timestamps', () => {
  const early = new Date(1650000000 * 1000);
  const late = new Date(1750000000 * 1000);

  describe('earliest', () => {
    it('returns the earliest of the defined dates', () => {
      expect(earliest([late, null, early, undefined])).toEqual(early);
    });

    it('returns null when no date is defined', () => {
      expect(earliest([null, undefined])).toBeNull();
      expect(earliest([])).toBeNull();
    });
  });

  describe('latest', () => {
    it('returns the latest of the defined dates', () => {
      expect(latest([early, undefined, late, null])).toEqual(late);
    });

    it('returns null when no date is defined', () => {
      expect(latest([null, undefined])).toBeNull();
      expect(latest([])).toBeNull();
    });
  });
});
