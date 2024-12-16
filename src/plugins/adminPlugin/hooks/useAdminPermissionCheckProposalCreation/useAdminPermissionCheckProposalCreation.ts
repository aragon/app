import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IUsePermissionCheckGuardSlotParams } from '@/modules/governance/types/permissionCheckGuardParams';
import type { IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useAccount } from 'wagmi';

export interface IUseAdminPermissionCheckProposalCreationParams
    extends IUsePermissionCheckGuardSlotParams<IPluginSettings> {}

export const useAdminPermissionCheckProposalCreation = (
    params: IUseAdminPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { plugin } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const memberExistsParams = { memberAddress: address as string, pluginAddress: plugin.address };
    const { data: hasPermission, isLoading } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: address != null },
    );

    if (hasPermission) {
        return {
            hasPermission: true,
        };
    }

    return {
        hasPermission: false,
        settings: [
            {
                term: t('app.plugins.admin.adminProposalCreationRequirements.name'),
                definition: t('app.plugins.admin.adminPermissionCheckProposalCreation.pluginName'),
            },
            {
                term: t('app.plugins.admin.adminPermissionCheckProposalCreation.action'),
                definition: t('app.plugins.admin.adminPermissionCheckProposalCreation.requirement'),
            },
        ],
        isLoading,
    };
};
