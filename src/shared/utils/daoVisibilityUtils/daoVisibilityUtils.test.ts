import type { IDaoOverride } from '@/shared/api/cmsService';
import { generateDaoPlugin } from '@/shared/testUtils';
import { daoVisibilityUtils } from './daoVisibilityUtils';

describe('daoVisibilityUtils', () => {
    describe('filterHiddenPlugins', () => {
        it('returns all plugins when override is undefined', () => {
            const plugins = [
                generateDaoPlugin({ address: '0xAAA' }),
                generateDaoPlugin({ address: '0xBBB' }),
            ];

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, undefined),
            ).toEqual(plugins);
        });

        it('returns all plugins when pluginsToHide is undefined', () => {
            const plugins = [
                generateDaoPlugin({ address: '0xAAA' }),
                generateDaoPlugin({ address: '0xBBB' }),
            ];
            const override: IDaoOverride = {};

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, override),
            ).toEqual(plugins);
        });

        it('returns all plugins when pluginsToHide is empty', () => {
            const plugins = [
                generateDaoPlugin({ address: '0xAAA' }),
                generateDaoPlugin({ address: '0xBBB' }),
            ];
            const override: IDaoOverride = { pluginsToHide: [] };

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, override),
            ).toEqual(plugins);
        });

        it('filters out plugins whose addresses are in pluginsToHide', () => {
            const plugins = [
                generateDaoPlugin({ address: '0xAAA' }),
                generateDaoPlugin({ address: '0xBBB' }),
                generateDaoPlugin({ address: '0xCCC' }),
            ];
            const override: IDaoOverride = {
                pluginsToHide: [{ address: '0xBBB', name: 'Plugin B' }],
            };

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, override),
            ).toEqual([plugins[0], plugins[2]]);
        });

        it('performs case-insensitive address comparison', () => {
            const plugins = [
                generateDaoPlugin({ address: '0xaAbBcC' }),
                generateDaoPlugin({ address: '0xDDEEFF' }),
            ];
            const override: IDaoOverride = {
                pluginsToHide: [{ address: '0xAABBCC', name: 'Plugin A' }],
            };

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, override),
            ).toEqual([plugins[1]]);
        });

        it('filters out multiple plugins', () => {
            const plugins = [
                generateDaoPlugin({ address: '0x111' }),
                generateDaoPlugin({ address: '0x222' }),
                generateDaoPlugin({ address: '0x333' }),
            ];
            const override: IDaoOverride = {
                pluginsToHide: [
                    { address: '0x111', name: 'Plugin 1' },
                    { address: '0x333', name: 'Plugin 3' },
                ],
            };

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, override),
            ).toEqual([plugins[1]]);
        });

        it('returns empty array when all plugins are hidden', () => {
            const plugins = [
                generateDaoPlugin({ address: '0xAAA' }),
                generateDaoPlugin({ address: '0xBBB' }),
            ];
            const override: IDaoOverride = {
                pluginsToHide: [
                    { address: '0xAAA', name: 'Plugin A' },
                    { address: '0xBBB', name: 'Plugin B' },
                ],
            };

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, override),
            ).toEqual([]);
        });

        it('ignores addresses in pluginsToHide that do not match any plugin', () => {
            const plugins = [generateDaoPlugin({ address: '0xAAA' })];
            const override: IDaoOverride = {
                pluginsToHide: [
                    { address: '0xNONEXISTENT', name: 'Unknown plugin' },
                ],
            };

            expect(
                daoVisibilityUtils.filterHiddenPlugins(plugins, override),
            ).toEqual(plugins);
        });
    });
});
