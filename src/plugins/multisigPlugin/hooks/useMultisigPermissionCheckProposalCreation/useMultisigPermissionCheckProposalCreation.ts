import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useAccount } from 'wagmi';
import type { IMultisigPluginSettings } from './../../types/multisigPluginSettings';

export interface IUseMultisigPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams<IMultisigPluginSettings> {}

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
                term: t('app.plugins.multisig.multisigPermissionCheckProposalCreation.pluginLabelName'),
                definition: pluginName,
            },
            {
                term: t('app.plugins.multisig.multisigPermissionCheckProposalCreation.function'),
                definition: t('app.plugins.multisig.multisigPermissionCheckProposalCreation.requirement'),
            },
        ],
        isLoading,
    };
};
