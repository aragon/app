import { addressUtils } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useConnection } from 'wagmi';
import {
    type IGetMemberParams,
    useMember,
} from '@/modules/governance/api/governanceService';
import { useImpersonatedAddress } from '@/shared/hooks/useImpersonatedAddress';
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
    const { daoId, pluginAddress, token, enableDelegation = false } = params;
    const { address: walletAddress } = useConnection();
    const impersonatedAddress = useImpersonatedAddress();
    const connectedAddress = impersonatedAddress ?? walletAddress;

    const delegateQueryEnabled = enableDelegation && connectedAddress != null;

    const { data: delegateAddress } = useTokenCurrentDelegate({
        tokenAddress: token.address,
        userAddress: connectedAddress,
        network: token.network,
        enabled: delegateQueryEnabled,
    });

    const hasValidDelegate = useMemo(
        () =>
            enableDelegation &&
            delegateAddress != null &&
            delegateAddress !== zeroAddress &&
            !addressUtils.isAddressEqual(
                delegateAddress,
                connectedAddress ?? '',
            ),
        [connectedAddress, delegateAddress, enableDelegation],
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
        if (connectedUserMemberData?.address == null) {
            return undefined;
        }

        // votingPower: null means the single-member endpoint doesn't populate it —
        // the member exists so treat as pinnable. Only skip when VP is explicitly "0".
        const vp = connectedUserMemberData.votingPower;
        if (vp != null && bigIntUtils.safeParse(vp) <= BigInt(0)) {
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
