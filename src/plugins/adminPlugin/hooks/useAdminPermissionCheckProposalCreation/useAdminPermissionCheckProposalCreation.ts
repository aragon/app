import { useMemberExists } from '@/modules/governance/api/governanceService';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
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
    const { data, isLoading } = useMemberExists({ urlParams: memberExistsParams }, { enabled: address != null });

    const pluginName = daoUtils.getPluginName(plugin);

    const settings = [
        {
            term: t('app.plugins.admin.adminPermissionCheckProposalCreation.pluginLabelName'),
            definition: pluginName,
        },
        {
            term: t('app.plugins.admin.adminPermissionCheckProposalCreation.function'),
            definition: t('app.plugins.admin.adminPermissionCheckProposalCreation.requirement'),
        },
    ];

    const hasPermission = data?.status;

    return {
        hasPermission: !!hasPermission,
        settings: [settings],
        isLoading,
        isRestricted: true,
    };
};
