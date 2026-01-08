import { useAccount } from 'wagmi';
import { useMemberExists } from '@/modules/governance/api/governanceService';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IUseAdminPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams {}

export const useAdminPermissionCheckProposalCreation = (
    params: IUseAdminPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId } = params;

    const { address } = useAccount();
    const { t } = useTranslations();

    const { network } = daoUtils.parseDaoId(daoId);

    const memberExistsParams = {
        urlParams: {
            memberAddress: address as string,
            pluginAddress: plugin.address,
            network,
        },
        queryParams: { network },
    };
    const { data, isLoading } = useMemberExists(memberExistsParams, {
        enabled: address != null,
    });
    const hasPermission = data?.status === true;

    const pluginName = daoUtils.getPluginName(plugin);

    const settings = [
        {
            term: t(
                'app.plugins.admin.adminPermissionCheckProposalCreation.pluginLabelName',
            ),
            definition: pluginName,
        },
        {
            term: t(
                'app.plugins.admin.adminPermissionCheckProposalCreation.function',
            ),
            definition: t(
                'app.plugins.admin.adminPermissionCheckProposalCreation.requirement',
            ),
        },
    ];

    return {
        hasPermission,
        settings: [settings],
        isLoading,
        isRestricted: true,
    };
};
