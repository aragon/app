import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IUseCheckPermissionGuardBaseParams } from '@/modules/governance/hooks/usePermissionCheckGuard/usePermissionCheckGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useAccount } from 'wagmi';

export interface IUseMultisigPermissionCheckProposalCreationParams extends IUseCheckPermissionGuardBaseParams {
    /**
     * Plugin to create the proposal for.
     */
    plugin: IDaoPlugin;
}

export const useMultisigPermissionCheckProposalCreation = (
    params: IUseMultisigPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { plugin } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const memberExistsParams = { memberAddress: address as string, pluginAddress: plugin.address };
    const { data: hasPermission, isLoading } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: address != null },
    );

    const pluginName = daoUtils.getPluginName(plugin);

    if (hasPermission) {
        return {
            hasPermission: true,
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
                term: t('app.plugins.multisig.multisigProposalCreationRequirements.proposalCreation'),
                definition: t('app.plugins.multisig.multisigProposalCreationRequirements.proposalCreationRequirement'),
            },
        ],
        isLoading,
    };
};
