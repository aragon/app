import { pluginVersionUtils } from './pluginVersionUtils';

describe('PluginVersionUtils', () => {

  describe('compareVersions', () => {
    it('returns isEqual when release and build match', () => {
      const current = { release: 1, build: 3};
      const target = { release: 1, build: 3};

      const result = pluginVersionUtils.compareVersions(current, target);

      expect(result).toEqual({ isEqual: true, isLessThan: false, isGreaterThan: false });
    });

    it('returns isLessThan when current.release < target.release', () => {
      const current = { release: 1, build: 3};
      const target  = { release: 2, build: 1};

      const result = pluginVersionUtils.compareVersions(current, target);

      expect(result).toEqual({ isEqual: false, isLessThan: true, isGreaterThan: false });
    });

    it('returns isGreaterThan when current.release > target.release', () => {
      const current = { release: 2, build: 1};
      const target  = { release: 1, build: 3};

      const result = pluginVersionUtils.compareVersions(current, target);

      expect(result).toEqual({ isEqual: false, isLessThan: false, isGreaterThan: true });
    });

    it('returns isLessThan when same release but current.build < target.build', () => {
      const current = { release: 1, build: 2};
      const target  = { release: 1, build: 3};

      const result = pluginVersionUtils.compareVersions(current, target);

      expect(result).toEqual({ isEqual: false, isLessThan: true, isGreaterThan: false });
    });

    it('returns isGreaterThan when same release but current.build > target.build', () => {
      const current = { release: 1, build: 4};
      const target  = { release: 1, build: 3};

      const result = pluginVersionUtils.compareVersions(current, target);

      expect(result).toEqual({ isEqual: false, isLessThan: false, isGreaterThan: true });
    });
  });
});
