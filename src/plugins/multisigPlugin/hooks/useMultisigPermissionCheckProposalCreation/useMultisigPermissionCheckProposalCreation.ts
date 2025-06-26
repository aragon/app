import { useMemberExists } from '@/modules/governance/api/governanceService';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useAccount } from 'wagmi';
import type { IMultisigPluginSettings } from '../../types';

export interface IUseMultisigPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams<IMultisigPluginSettings> {}

export const useMultisigPermissionCheckProposalCreation = (
    params: IUseMultisigPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId } = params;

    const { address } = useAccount();
    const { t } = useTranslations();

    const { onlyListed } = plugin.settings;
    const pluginName = daoUtils.getPluginName(plugin);
    const { network } = daoUtils.parseDaoId(daoId);

    const memberExistsParams = { memberAddress: address as string, pluginAddress: plugin.address, network };
    const { data: memberExists, isLoading } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: address != null },
    );

    const hasPermission = memberExists?.status === true || !onlyListed;

    const settings = [
        {
            term: t('app.plugins.multisig.multisigPermissionCheckProposalCreation.pluginLabelName'),
            definition: pluginName,
        },
        {
            term: t('app.plugins.multisig.multisigPermissionCheckProposalCreation.function'),
            definition: t('app.plugins.multisig.multisigPermissionCheckProposalCreation.requirement'),
        },
    ];

    return {
        hasPermission,
        settings: [settings],
        isLoading,
        isRestricted: onlyListed,
    };
};
