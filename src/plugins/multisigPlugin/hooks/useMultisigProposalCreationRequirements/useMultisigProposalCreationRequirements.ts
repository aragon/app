import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import { type IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticpantGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useAccount } from 'wagmi';

export interface IUseMultisigProposalCreationRequirementsParams extends IUseConnectedParticipantGuardBaseParams {}

export const useMultisigProposalCreationRequirements = (
    params: IUseMultisigProposalCreationRequirementsParams,
): IPermissionCheckGuardResult => {
    const { plugin } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const memberExistsParams = { memberAddress: address as string, pluginAddress: plugin.meta.address };
    const { data: hasPermission, isLoading } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: address != null },
    );

    const pluginName = daoUtils.getPluginName(plugin.meta);

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
                term: t('app.plugins.multisig.multisigProposalCreationRequirements.name'),
                definition: pluginName,
            },
            {
                term: t('app.plugins.multisig.multisigProposalCreationRequirements.proposalCreationRequirement'),
                definition: 'Multisig member',
            },
        ],
        isLoading: isLoading,
    };
};
