import type { IDaoPlugin } from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateSubDao } from '@/shared/testUtils';
import { subDaoDisplayUtils } from './subDaoDisplayUtils';

const groupLabel = 'All items';
const fallbackLabel = 'Fallback';

describe('subDaoDisplayUtils', () => {
    describe('getPluginDaoAddress', () => {
        it('returns lowercased daoAddress when present', () => {
            const plugin = generateDaoPlugin({ daoAddress: '0xABC' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.getPluginDaoAddress(plugin)).toEqual('0xabc');
        });

        it('falls back to address when daoAddress is missing', () => {
            const plugin = generateDaoPlugin({ address: '0xDEF' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.getPluginDaoAddress(plugin)).toEqual('0xdef');
        });
    });

    describe('isParentPlugin', () => {
        it('returns true when plugin daoAddress matches DAO address', () => {
            const dao = generateDao({ address: '0xParent' });
            const plugin = generateDaoPlugin({ daoAddress: '0xParent' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.isParentPlugin({ dao, plugin })).toBe(true);
        });

        it('returns false otherwise', () => {
            const dao = generateDao({ address: '0xParent' });
            const plugin = generateDaoPlugin({ daoAddress: '0xChild' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.isParentPlugin({ dao, plugin })).toBe(false);
        });
    });

    describe('getMatchingSubDao', () => {
        it('returns the matching subDAO by address', () => {
            const subDao = generateSubDao({ address: '0xSub' });
            const dao = generateDao({ subDaos: [subDao] });
            const plugin = generateDaoPlugin({ daoAddress: '0xSub' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.getMatchingSubDao({ dao, plugin })).toEqual(subDao);
        });

        it('returns undefined when no match', () => {
            const dao = generateDao({ subDaos: [generateSubDao({ address: '0xOther' })] });
            const plugin = generateDaoPlugin({ daoAddress: '0xMissing' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.getMatchingSubDao({ dao, plugin })).toBeUndefined();
        });
    });

    describe('getPluginDisplayName', () => {
        it('returns group label for all tab (id/uniqueId match)', () => {
            const plugin = { id: 'all', uniqueId: 'all' } as IDaoPlugin;
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao: undefined, plugin, groupLabel, fallbackLabel })).toBe(
                groupLabel,
            );
        });

        it('returns group label when plugin label already equals group label', () => {
            const plugin = { id: 'foo', uniqueId: 'bar', label: groupLabel } as IDaoPlugin;
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao: undefined, plugin, groupLabel, fallbackLabel })).toBe(
                groupLabel,
            );
        });

        it('returns parent DAO name when parent plugin is selected', () => {
            const dao = generateDao({ name: 'Parent DAO', address: '0xParent' });
            const plugin = generateDaoPlugin({ daoAddress: '0xParent' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao, plugin, groupLabel, fallbackLabel })).toBe(
                'Parent DAO',
            );
        });

        it('returns matching subDAO name when a subDAO plugin is selected', () => {
            const subDao = generateSubDao({ address: '0xSub', name: 'Child DAO', network: Network.POLYGON_MAINNET });
            const dao = generateDao({ subDaos: [subDao] });
            const plugin = generateDaoPlugin({ daoAddress: '0xSub' }) as IDaoPlugin;
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao, plugin, groupLabel, fallbackLabel })).toBe(
                'Child DAO',
            );
        });

        it('falls back to fallbackLabel when no matches are found', () => {
            const dao = generateDao({ name: 'Parent DAO' });
            const plugin = generateDaoPlugin({ address: '0xX', name: undefined }) as IDaoPlugin;
            expect(subDaoDisplayUtils.getPluginDisplayName({ dao, plugin, groupLabel, fallbackLabel })).toBe(
                fallbackLabel,
            );
        });
    });
});
