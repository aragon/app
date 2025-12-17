import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateSubDao } from '@/shared/testUtils';
import { subDaoDisplayUtils } from './subDaoDisplayUtils';

const groupLabel = 'All items';
const fallbackLabel = 'Fallback';

describe('subDaoDisplayUtils', () => {
    describe('getPluginDaoAddress', () => {
        it('returns lowercased daoAddress when present', () => {
            const plugin = generateDaoPlugin({
                daoAddress: '0x1111111111111111111111111111111111111111',
            });
            expect(subDaoDisplayUtils.getPluginDaoAddress(plugin)).toEqual('0x1111111111111111111111111111111111111111');
        });

        it('falls back to address when daoAddress is missing', () => {
            const plugin = generateDaoPlugin({
                address: '0x2222222222222222222222222222222222222222',
            });
            expect(subDaoDisplayUtils.getPluginDaoAddress(plugin)).toEqual('0x2222222222222222222222222222222222222222');
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
            const dao = generateDao({
                subDaos: [generateSubDao({ address: otherAddress })],
            });
            const plugin = generateDaoPlugin({ daoAddress: missingAddress });
            expect(subDaoDisplayUtils.getMatchingSubDao({ dao, plugin })).toBeUndefined();
        });
    });

    describe('getPluginDisplayName', () => {
        it('returns parent DAO name when parent plugin is selected', () => {
            const parentAddress = '0x1111111111111111111111111111111111111111';
            const dao = generateDao({
                name: 'Parent DAO',
                address: parentAddress,
            });
            const plugin = generateDaoPlugin({ daoAddress: parentAddress });
            expect(
                subDaoDisplayUtils.getPluginDisplayName({
                    dao,
                    plugin,
                    groupLabel,
                    fallbackLabel,
                })
            ).toBe('Parent DAO');
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
            expect(
                subDaoDisplayUtils.getPluginDisplayName({
                    dao,
                    plugin,
                    groupLabel,
                    fallbackLabel,
                })
            ).toBe('Child DAO');
        });

        it('falls back to fallbackLabel when no matches are found', () => {
            const dao = generateDao({ name: 'Parent DAO' });
            const plugin = generateDaoPlugin({
                address: '0x6666666666666666666666666666666666666666',
                name: undefined,
            });
            expect(
                subDaoDisplayUtils.getPluginDisplayName({
                    dao,
                    plugin,
                    groupLabel,
                    fallbackLabel,
                })
            ).toBe(fallbackLabel);
        });
    });
});
