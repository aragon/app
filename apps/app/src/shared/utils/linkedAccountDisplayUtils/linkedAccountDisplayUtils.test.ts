import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateLinkedAccount,
} from '@/shared/testUtils';
import { linkedAccountDisplayUtils } from './linkedAccountDisplayUtils';

const groupLabel = 'All items';
const fallbackLabel = 'Fallback';

describe('linkedAccountDisplayUtils', () => {
    describe('getPluginDaoAddress', () => {
        it('returns lowercased daoAddress when present', () => {
            const plugin = generateDaoPlugin({
                daoAddress: '0x1111111111111111111111111111111111111111',
            });
            expect(
                linkedAccountDisplayUtils.getPluginDaoAddress(plugin),
            ).toEqual('0x1111111111111111111111111111111111111111');
        });

        it('falls back to address when daoAddress is missing', () => {
            const plugin = generateDaoPlugin({
                address: '0x2222222222222222222222222222222222222222',
            });
            expect(
                linkedAccountDisplayUtils.getPluginDaoAddress(plugin),
            ).toEqual('0x2222222222222222222222222222222222222222');
        });
    });

    describe('isParentPlugin', () => {
        it('returns true when plugin daoAddress matches DAO address', () => {
            const parentAddress = '0x1111111111111111111111111111111111111111';
            const dao = generateDao({ address: parentAddress });
            const plugin = generateDaoPlugin({ daoAddress: parentAddress });
            expect(
                linkedAccountDisplayUtils.isParentPlugin({ dao, plugin }),
            ).toBe(true);
        });

        it('returns false otherwise', () => {
            const parentAddress = '0x1111111111111111111111111111111111111111';
            const childAddress = '0x2222222222222222222222222222222222222222';
            const dao = generateDao({ address: parentAddress });
            const plugin = generateDaoPlugin({ daoAddress: childAddress });
            expect(
                linkedAccountDisplayUtils.isParentPlugin({ dao, plugin }),
            ).toBe(false);
        });
    });

    describe('getMatchingLinkedAccount', () => {
        it('returns the matching linked account by address', () => {
            const linkedAccountAddress =
                '0x3333333333333333333333333333333333333333';
            const linkedAccount = generateLinkedAccount({
                address: linkedAccountAddress,
            });
            const dao = generateDao({ linkedAccounts: [linkedAccount] });
            const plugin = generateDaoPlugin({
                daoAddress: linkedAccountAddress,
            });
            expect(
                linkedAccountDisplayUtils.getMatchingLinkedAccount({
                    dao,
                    plugin,
                }),
            ).toEqual(linkedAccount);
        });

        it('returns undefined when no match', () => {
            const otherAddress = '0x4444444444444444444444444444444444444444';
            const missingAddress = '0x5555555555555555555555555555555555555555';
            const dao = generateDao({
                linkedAccounts: [
                    generateLinkedAccount({ address: otherAddress }),
                ],
            });
            const plugin = generateDaoPlugin({ daoAddress: missingAddress });
            expect(
                linkedAccountDisplayUtils.getMatchingLinkedAccount({
                    dao,
                    plugin,
                }),
            ).toBeUndefined();
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
                linkedAccountDisplayUtils.getPluginDisplayName({
                    dao,
                    plugin,
                    groupLabel,
                    fallbackLabel,
                }),
            ).toBe('Parent DAO');
        });

        it('returns matching linked account name when a linked account plugin is selected', () => {
            const linkedAccountAddress =
                '0x3333333333333333333333333333333333333333';
            const linkedAccount = generateLinkedAccount({
                address: linkedAccountAddress,
                name: 'Child DAO',
                network: Network.POLYGON_MAINNET,
            });
            const dao = generateDao({ linkedAccounts: [linkedAccount] });
            const plugin = generateDaoPlugin({
                daoAddress: linkedAccountAddress,
            });
            expect(
                linkedAccountDisplayUtils.getPluginDisplayName({
                    dao,
                    plugin,
                    groupLabel,
                    fallbackLabel,
                }),
            ).toBe('Child DAO');
        });

        it('falls back to fallbackLabel when no matches are found', () => {
            const dao = generateDao({ name: 'Parent DAO' });
            const plugin = generateDaoPlugin({
                address: '0x6666666666666666666666666666666666666666',
                name: undefined,
            });
            expect(
                linkedAccountDisplayUtils.getPluginDisplayName({
                    dao,
                    plugin,
                    groupLabel,
                    fallbackLabel,
                }),
            ).toBe(fallbackLabel);
        });
    });
});
