import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IGetMemberListQueryParams } from '../../governanceService.api';
import { resolveMemberSource } from './resolveMemberSource';

describe('resolveMemberSource', () => {
    const baseParams: IGetMemberListQueryParams = {
        daoId: 'dao-id',
        pluginAddress: '0xPlugin',
        tokenAddress: '0xToken',
        network: Network.ETHEREUM_MAINNET,
        pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
    };

    it('routes mainnet token-voting plain ERC-20 to the subdomain', () => {
        expect(resolveMemberSource(baseParams)).toBe('subdomain');
    });

    it.each([
        [
            'non-mainnet network',
            { ...baseParams, network: Network.POLYGON_MAINNET },
        ],
        [
            'non-token-voting interface type',
            {
                ...baseParams,
                pluginInterfaceType: PluginInterfaceType.MULTISIG,
            },
        ],
        ['missing tokenAddress', { ...baseParams, tokenAddress: undefined }],
        ['missing network', { ...baseParams, network: undefined }],
        [
            'wrapped / VE-adapter governance token',
            { ...baseParams, tokenUnderlying: '0xunderlying' },
        ],
    ])('routes to the backend for %s', (_label, queryParams) => {
        expect(resolveMemberSource(queryParams)).toBe('backend');
    });
});
