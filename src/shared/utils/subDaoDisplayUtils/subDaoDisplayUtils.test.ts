import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateSubDao } from '@/shared/testUtils';
import { subDaoDisplayUtils } from './subDaoDisplayUtils';

const groupLabel = 'All items';
const fallbackLabel = 'Fallback';

describe('subDaoDisplayUtils', () => {
    describe('getPluginDaoAddress', () => {
        it('returns lowercased daoAddress when present', () => {
            const plugin = generateDaoPlugin({ daoAddress: '0x1111111111111111111111111111111111111111' });
            expect(subDaoDisplayUtils.getPluginDaoAddress(plugin)).toEqual(
                '0x1111111111111111111111111111111111111111',
            );
        });

        it('falls back to address when daoAddress is missing', () => {
            const plugin = generateDaoPlugin({ address: '0x2222222222222222222222222222222222222222' });
            expect(subDaoDisplayUtils.getPluginDaoAddress(plugin)).toEqual(
                '0x2222222222222222222222222222222222222222',
            );
        });
    });

    describe('isParentPlugin', () => {
        it('returns true when plugin daoAddress matches DAO address', () => {
            const parentAddress = '0x1111111111111111111111111111111111111111';
            const dao = generateDao({ address: parentAddress });
            const plugin = generateDaoPlugin({ daoAddress: parentAddress });
            expect(subDaoDisplayUtils.isParentPlugin({ dao, plugin })).toBe(true);
        });

        it('returns false otherwise', () => {
            const parentAddress = '0x1111111111111111111111111111111111111111';
            const childAddress = '0x2222222222222222222222222222222222222222';
            const dao = generateDao({ address: parentAddress });
            const plugin = generateDaoPlugin({ daoAddress: childAddress });
            expect(subDaoDisplayUtils.isParentPlugin({ dao, plugin })).toBe(false);
        });
    });

    describe('getMatchingSubDao', () => {
        it('returns the matching subDAO by address', () => {
            const subDaoAddress = '0x3333333333333333333333333333333333333333';
            const subDao = generateSubDao({ address: subDaoAddress });
            const dao = generateDao({ subDaos: [subDao] });
            const plugin = generateDaoPlugin({ daoAddress: subDaoAddress });
            expect(subDaoDisplayUtils.getMatchingSubDao({ dao, plugin })).toEqual(subDao);
        });

        it('returns undefined when no match', () => {
            const otherAddress = '0x4444444444444444444444444444444444444444';
            const missingAddress = '0x5555555555555555555555555555555555555555';
            const dao = generateDao({ subDaos: [generateSubDao({ address: otherAddress })] });
            const plugin = generateDaoPlugin({ daoAddress: missingAddress });
            expect(subDaoDisplayUtils.getMatchingSubDao({ dao, plugin })).toBeUndefined();
        });
    });

    describe('getPluginDisplayName', () => {
        it('returns parent DAO name when parent plugin is selected', () => {
            const parentAddress = '0x1111111111111111111111111111111111111111';
            const dao = generateDao({ name: 'Parent DAO', address: parentAddress });
            const plugin = generateDaoPlugin({ daoAddress: parentAddress });
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao, plugin, groupLabel, fallbackLabel })).toBe(
                'Parent DAO',
            );
        });

        it('returns matching subDAO name when a subDAO plugin is selected', () => {
            const subDaoAddress = '0x3333333333333333333333333333333333333333';
            const subDao = generateSubDao({
                address: subDaoAddress,
                name: 'Child DAO',
                network: Network.POLYGON_MAINNET,
            });
            const dao = generateDao({ subDaos: [subDao] });
            const plugin = generateDaoPlugin({ daoAddress: subDaoAddress });
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao, plugin, groupLabel, fallbackLabel })).toBe(
                'Child DAO',
            );
        });

        it('falls back to fallbackLabel when no matches are found', () => {
            const dao = generateDao({ name: 'Parent DAO' });
            const plugin = generateDaoPlugin({
                address: '0x6666666666666666666666666666666666666666',
                name: undefined,
            });
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao, plugin, groupLabel, fallbackLabel })).toBe(
                fallbackLabel,
            );
        });
    });

    describe('deduplicatePluginsByDaoAddress', () => {
        it('removes duplicate plugins based on DAO address', () => {
            const plugin1 = { id: 'p1', meta: generateDaoPlugin({ daoAddress: '0xSubDao1' }) };
            const plugin2 = { id: 'p2', meta: generateDaoPlugin({ daoAddress: '0xSubDao1' }) };
            const plugin3 = { id: 'p3', meta: generateDaoPlugin({ daoAddress: '0xSubDao2' }) };

            const result = subDaoDisplayUtils.deduplicatePluginsByDaoAddress({
                plugins: [plugin1, plugin2, plugin3],
                isGroupFilter: () => false,
            });

            expect(result).toHaveLength(2);
            expect(result).toEqual([plugin1, plugin3]);
        });

        it('preserves the first occurrence of duplicate addresses', () => {
            const plugin1 = { id: 'p1', meta: generateDaoPlugin({ daoAddress: '0xAAA' }) };
            const plugin2 = { id: 'p2', meta: generateDaoPlugin({ daoAddress: '0xAAA' }) };
            const plugin3 = { id: 'p3', meta: generateDaoPlugin({ daoAddress: '0xAAA' }) };

            const result = subDaoDisplayUtils.deduplicatePluginsByDaoAddress({
                plugins: [plugin1, plugin2, plugin3],
                isGroupFilter: () => false,
            });

            expect(result).toEqual([plugin1]);
        });

        it('never filters out group filter plugins', () => {
            const groupPlugin = { id: 'group', meta: generateDaoPlugin({ daoAddress: '0xGroup' }) };
            const plugin1 = { id: 'p1', meta: generateDaoPlugin({ daoAddress: '0xGroup' }) };

            const result = subDaoDisplayUtils.deduplicatePluginsByDaoAddress({
                plugins: [groupPlugin, plugin1],
                isGroupFilter: (p) => p.id === 'group',
            });

            expect(result).toHaveLength(2);
            expect(result).toEqual([groupPlugin, plugin1]);
        });

        it('preserves plugins with empty DAO addresses', () => {
            const plugin1 = { id: 'p1', meta: generateDaoPlugin({ daoAddress: '' }) };
            const plugin2 = { id: 'p2', meta: generateDaoPlugin({ daoAddress: '' }) };
            const plugin3 = { id: 'p3', meta: generateDaoPlugin({ daoAddress: '0xSubDao1' }) };

            const result = subDaoDisplayUtils.deduplicatePluginsByDaoAddress({
                plugins: [plugin1, plugin2, plugin3],
                isGroupFilter: () => false,
            });

            expect(result).toHaveLength(3);
            expect(result).toEqual([plugin1, plugin2, plugin3]);
        });

        it('handles case-insensitive address comparison', () => {
            const plugin1 = { id: 'p1', meta: generateDaoPlugin({ daoAddress: '0xABC123' }) };
            const plugin2 = { id: 'p2', meta: generateDaoPlugin({ daoAddress: '0xabc123' }) };
            const plugin3 = { id: 'p3', meta: generateDaoPlugin({ daoAddress: '0xABC123' }) };

            const result = subDaoDisplayUtils.deduplicatePluginsByDaoAddress({
                plugins: [plugin1, plugin2, plugin3],
                isGroupFilter: () => false,
            });

            expect(result).toHaveLength(1);
            expect(result).toEqual([plugin1]);
        });

        it('returns empty array when given empty array', () => {
            const result = subDaoDisplayUtils.deduplicatePluginsByDaoAddress({
                plugins: [],
                isGroupFilter: () => false,
            });

            expect(result).toEqual([]);
        });

        it('handles mixed group filters and regular plugins', () => {
            const groupPlugin = { id: 'group', meta: generateDaoPlugin({ daoAddress: '0xGroup' }) };
            const plugin1 = { id: 'p1', meta: generateDaoPlugin({ daoAddress: '0xSubDao1' }) };
            const plugin2 = { id: 'p2', meta: generateDaoPlugin({ daoAddress: '0xSubDao1' }) };
            const plugin3 = { id: 'p3', meta: generateDaoPlugin({ daoAddress: '0xSubDao2' }) };

            const result = subDaoDisplayUtils.deduplicatePluginsByDaoAddress({
                plugins: [groupPlugin, plugin1, plugin2, plugin3],
                isGroupFilter: (p) => p.id === 'group',
            });

            expect(result).toHaveLength(3);
            expect(result).toEqual([groupPlugin, plugin1, plugin3]);
        });
    });
});
