import { type IPlugin, pluginRegistryUtils } from '../pluginRegistryUtils';
import { generateDaoPlugin } from './../../testUtils/generators/daoPlugin';
import { pluginVersionUtils } from './pluginVersionUtils';

describe('PluginVersionUtils', () => {
    const getPluginSpy = jest.spyOn(pluginRegistryUtils, 'getPlugin');

    afterEach(() => {
        getPluginSpy.mockReset();
    });

    describe('compareVersions', () => {
        it('returns isEqual when release and build match', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 1, build: 3 };

            const result = pluginVersionUtils.compareVersions(current, target);

            expect(result).toEqual({ isEqual: true, isLessThan: false, isGreaterThan: false });
        });

        it('returns isLessThan when current.release < target.release', () => {
            const current = { release: 1, build: 3 };
            const target = { release: 2, build: 1 };

            const result = pluginVersionUtils.compareVersions(current, target);

            expect(result).toEqual({ isEqual: false, isLessThan: true, isGreaterThan: false });
        });

        it('returns isGreaterThan when current.release > target.release', () => {
            const current = { release: 2, build: 1 };
            const target = { release: 1, build: 3 };

            const result = pluginVersionUtils.compareVersions(current, target);

            expect(result).toEqual({ isEqual: false, isLessThan: false, isGreaterThan: true });
        });

        it('returns isLessThan when same release but current.build < target.build', () => {
            const current = { release: 1, build: 2 };
            const target = { release: 1, build: 3 };

            const result = pluginVersionUtils.compareVersions(current, target);

            expect(result).toEqual({ isEqual: false, isLessThan: true, isGreaterThan: false });
        });

        it('returns isGreaterThan when same release but current.build > target.build', () => {
            const current = { release: 1, build: 4 };
            const target = { release: 1, build: 3 };

            const result = pluginVersionUtils.compareVersions(current, target);

            expect(result).toEqual({ isEqual: false, isLessThan: false, isGreaterThan: true });
        });
    });

    describe('pluginNeedsUpgrade', () => {
        it('returns true when current build is less than target build and release is the same', () => {
            const current = generateDaoPlugin({ subdomain: 'multisig', release: '1', build: '2' });

            const target = {
                installVersion: { release: '1', build: '3' },
            } as unknown as IPlugin;

            getPluginSpy.mockReturnValue(target);

            const result = pluginVersionUtils.pluginNeedsUpgrade(current);

            expect(result).toBe(true);
        });

        it('returns true when current release is less than target release', () => {
            const current = generateDaoPlugin({ subdomain: 'multisig', release: '1', build: '2' });

            const target = {
                installVersion: { release: '2', build: '0' },
            } as unknown as IPlugin;

            getPluginSpy.mockReturnValue(target);

            const result = pluginVersionUtils.pluginNeedsUpgrade(current);

            expect(result).toBe(true);
        });

        it('returns false when versions are equal', () => {
            const current = generateDaoPlugin({ subdomain: 'multisig', release: '1', build: '2' });

            const target = {
                installVersion: { release: '1', build: '2' },
            } as unknown as IPlugin;

            getPluginSpy.mockReturnValue(target);

            const result = pluginVersionUtils.pluginNeedsUpgrade(current);

            expect(result).toBe(false);
        });
    });
});
