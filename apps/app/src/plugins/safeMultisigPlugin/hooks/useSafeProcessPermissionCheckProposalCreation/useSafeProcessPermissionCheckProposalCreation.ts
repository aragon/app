import { addressUtils } from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useCanCreateProposal } from '@/modules/governance/api/governanceService/queries/useCanCreateProposal';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { useSafeInfo } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';

/** Checks ownership and the Safe's execute grant on the specific DAO, including its condition. */
export const useSafeProcessPermissionCheckProposalCreation = (
    params: IPermissionCheckGuardParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId, useConnectedUserInfo = true } = params;
    const { address } = useWalletAccount();
    const { t } = useTranslations();
    const { network, address: rootDaoAddress } = daoUtils.parseDaoId(daoId);
    const enabled = useConnectedUserInfo && address != null;
    const {
        data: safeInfo,
        isPending: isSafeInfoPending,
        isError: isSafeInfoError,
    } = useSafeInfo(
        {
            urlParams: { network, address: plugin.address },
        },
        { enabled },
    );
    const { data, isPending, isError } = useCanCreateProposal(
        {
            queryParams: {
                network,
                pluginAddress: plugin.address,
                daoAddress: plugin.daoAddress ?? rootDaoAddress,
                memberAddress: address!,
            },
        },
        { enabled },
    );
    const isOwner =
        enabled &&
        safeInfo?.owners.some((owner) =>
            addressUtils.isAddressEqual(owner, address),
        ) === true;

    return {
        hasPermission:
            isOwner && !isSafeInfoError && !isError && data?.status === true,
        isLoading: enabled && (isSafeInfoPending || isPending),
        isRestricted: true,
        settings: [
            [
                {
                    term: t(
                        'app.plugins.spp.sppExternalPermissionCheckProposalCreation.pluginLabelName',
                    ),
                    definition: daoUtils.getPluginName(plugin),
                },
                {
                    term: t(
                        'app.plugins.spp.sppExternalPermissionCheckProposalCreation.function',
                    ),
                    definition: t(
                        'app.plugins.safeMultisig.safeProcess.creationRequirement',
                    ),
                },
            ],
        ],
    };
};
