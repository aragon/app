import type { IDaoPlugin } from '../../api/daoService';
import type { IVersion } from '../versionComparatorUtils';
import { pluginMetaUtils } from './pluginMetaUtils';

describe('pluginMetaUtils', () => {
    describe('isVersionGreaterOrEqualTo', () => {
        it.each([
            {
                plugin: { release: '2', build: '1' } as IDaoPlugin,
                targetVersion: { release: 1, build: 3 } as IVersion,
                expected: true,
                description: 'plugin version is greater (higher release)',
            },
            {
                plugin: { release: '1', build: '5' } as IDaoPlugin,
                targetVersion: { release: 1, build: 3 } as IVersion,
                expected: true,
                description: 'plugin version is greater (higher build)',
            },
            {
                plugin: { release: '2', build: '0' } as IDaoPlugin,
                targetVersion: { release: 2, build: 0 } as IVersion,
                expected: true,
                description: 'plugin version is equal (different values)',
            },
            {
                plugin: { release: '1', build: '2' } as IDaoPlugin,
                targetVersion: { release: 1, build: 3 } as IVersion,
                expected: false,
                description: 'plugin version is less (lower build)',
            },
            {
                plugin: { release: '0', build: '9' } as IDaoPlugin,
                targetVersion: { release: 1, build: 0 } as IVersion,
                expected: false,
                description: 'plugin version is less (lower release)',
            },
        ])('returns $expected when $description', ({ plugin, targetVersion, expected }) => {
            const result = pluginMetaUtils.isVersionGreaterOrEqualTo(plugin, targetVersion);

            expect(result).toBe(expected);
        });
    });
});
