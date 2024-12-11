import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import { type IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticpantGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useAccount } from 'wagmi';

export interface IUseMultisigProposalCreationRequirementsParams extends IUseConnectedParticipantGuardBaseParams {}

export const useMultisigProposalCreationRequirements = (
    params: IUseMultisigProposalCreationRequirementsParams,
): IPermissionCheckGuardResult => {
    const { plugin } = params;
    const { address } = useAccount();

    const memberExistsParams = { memberAddress: address as string, pluginAddress: plugin.meta.address };
    const { data: hasPermission, isLoading } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: address != null },
    );

    const pluginName = plugin.meta.name ?? 'Multisig TODO'; // TODO

    if (hasPermission) {
        return {
            hasPermission: true,
            settings: [],
            isLoading: isLoading,
        };
    }

    return {
        hasPermission: false,
        settings: [
            {
                term: 'Name',
                definition: 'Group name',
            },
            {
                term: 'Proposal creation',
                definition: pluginName,
            },
        ],
        isLoading: isLoading,
    };
};
