import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { IToken } from '@/modules/finance/api/financeService';
import { memberOptions } from '@/modules/governance/api/governanceService';
import type { ITokenMember } from '../../types';

export interface IUseFeaturedDelegatesParams {
    /**
     * Addresses of the featured delegates to fetch.
     */
    addresses: string[];
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the token voting plugin.
     */
    pluginAddress: string;
    /**
     * Token associated with the plugin, required to fetch voting power.
     */
    token: IToken | undefined;
}

export const useFeaturedDelegates = (params: IUseFeaturedDelegatesParams) => {
    const { addresses, daoId, pluginAddress, token } = params;

    const queries = useMemo(
        () =>
            addresses.map((address) =>
                memberOptions<ITokenMember>(
                    {
                        urlParams: { address },
                        queryParams: {
                            daoId,
                            pluginAddress,
                            tokenAddress: token?.address ?? '',
                            network: token?.network,
                        },
                    },
                    { retry: false, enabled: token != null },
                ),
            ),
        [addresses, daoId, pluginAddress, token],
    );

    const results = useQueries({ queries });

    return useMemo(
        () =>
            addresses.map((address, index) => {
                const member = results[index]?.data;

                if (member != null) {
                    return member;
                }

                // Fallback: non-member delegate — return minimal token member shape
                return {
                    address,
                    ens: null,
                    type: 'token-voting' as const,
                    votingPower: null,
                    metrics: {
                        delegationCount: 0,
                        firstActivity: null,
                        lastActivity: null,
                    },
                } satisfies ITokenMember;
            }),
        [addresses, results],
    );
};
