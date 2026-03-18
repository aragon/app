import { addressUtils } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useConnection } from 'wagmi';
import {
    type IGetMemberParams,
    useMember,
} from '@/modules/governance/api/governanceService';
import { type Network, useDao } from '@/shared/api/daoService';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
import type { ITokenMember } from '../../types';
import { useTokenCurrentDelegate } from '../useTokenCurrentDelegate';
import type { IUseTokenPinnedMembersParams } from './useTokenPinnedMembers.api';

export interface IUseTokenPinnedMembersResult {
    connectedUserMember?: ITokenMember;
    delegateMember?: ITokenMember;
    hasValidDelegate: boolean;
}

export const useTokenPinnedMembers = (
    params: IUseTokenPinnedMembersParams,
): IUseTokenPinnedMembersResult => {
    const { daoId, pluginAddress, pluginSettings } = params;
    const { address: connectedAddress } = useConnection();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const delegateQueryEnabled =
        connectedAddress != null && dao?.network != null;

    const { data: delegateAddress } = useTokenCurrentDelegate({
        tokenAddress: pluginSettings.token.address,
        userAddress: connectedAddress,
        network: dao?.network as Network,
        enabled: delegateQueryEnabled,
    });

    const hasValidDelegate = useMemo(
        () =>
            delegateAddress != null &&
            delegateAddress !== zeroAddress &&
            !addressUtils.isAddressEqual(
                delegateAddress,
                connectedAddress ?? '',
            ),
        [connectedAddress, delegateAddress],
    );

    const connectedUserMemberParams = useMemo<IGetMemberParams>(
        () => ({
            urlParams: { address: connectedAddress ?? '' },
            queryParams: { daoId, pluginAddress },
        }),
        [connectedAddress, daoId, pluginAddress],
    );

    const delegateMemberParams = useMemo<IGetMemberParams>(
        () => ({
            urlParams: { address: delegateAddress ?? '' },
            queryParams: { daoId, pluginAddress },
        }),
        [daoId, delegateAddress, pluginAddress],
    );

    const { data: connectedUserMemberData } = useMember<ITokenMember>(
        connectedUserMemberParams,
        { enabled: connectedAddress != null },
    );

    const { data: delegateMember } = useMember<ITokenMember>(
        delegateMemberParams,
        { enabled: hasValidDelegate },
    );

    const connectedUserMember = useMemo(() => {
        if (
            connectedUserMemberData?.address == null ||
            bigIntUtils.safeParse(connectedUserMemberData.votingPower) <=
                BigInt(0)
        ) {
            return undefined;
        }

        return connectedUserMemberData;
    }, [connectedUserMemberData]);

    return {
        connectedUserMember,
        delegateMember,
        hasValidDelegate,
    };
};
