import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
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
    const { plugin } = params;

    const { address } = useAccount();
    const { t } = useTranslations();

    const { onlyListed } = plugin.settings;
    const pluginName = daoUtils.getPluginName(plugin);

    const memberExistsParams = { memberAddress: address as string, pluginAddress: plugin.address };
    const { data: memberExists, isLoading } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: address != null },
    );

    const hasPermission = memberExists === true || !onlyListed;

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
        isRestricted: onlyListed,
        settings: [settings],
        isLoading,
    };
};
