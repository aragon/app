import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { IPermissionCheckGuardParams } from '@/modules/governance/types/permissionCheckGuardParams';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useAccount } from 'wagmi';

export interface IUseAdminPermissionCheckProposalCreationParams extends IPermissionCheckGuardParams {}

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

    const pluginName = daoUtils.getPluginName(plugin);

    if (hasPermission) {
        return { hasPermission: true };
    }

    return {
        hasPermission: false,
        settings: [
            {
                term: t('app.plugins.admin.adminPermissionCheckProposalCreation.pluginLabelName'),
                definition: pluginName,
            },
            {
                term: t('app.plugins.admin.adminPermissionCheckProposalCreation.function'),
                definition: t('app.plugins.admin.adminPermissionCheckProposalCreation.requirement'),
            },
        ],
        isLoading,
    };
};
