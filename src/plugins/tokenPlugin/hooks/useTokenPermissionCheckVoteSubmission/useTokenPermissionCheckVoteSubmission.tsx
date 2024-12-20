import { useCanVote } from '@/modules/governance/api/governanceService/queries/useProposalCanVote';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, DateFormat, formatterUtils, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface ITokenPermissionCheckVoteSubmissionParams extends IPermissionCheckGuardParams<ITokenPluginSettings> {}

export const useTokenPermissionCheckVoteSubmission = (
    params: ITokenPermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { plugin, proposal } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const tokenSymbol = plugin.settings.token.symbol;

    const { id, blockTimestamp, network, transactionHash } = proposal!;

    const { data: hasPermission, isLoading } = useCanVote(
        { urlParams: { id }, queryParams: { userAddress: address as string } },
        { enabled: address != null },
    );

    const formattedCreationDate = formatterUtils.formatDate(blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const { chainId } = networkDefinitions[network];

    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    if (hasPermission) {
        return {
            hasPermission: true,
        };
    }

    return {
        hasPermission: false,
        settings: [
            {
                term: t('app.plugins.token.tokenPermissionCheckVoteSubmission.createdAt'),
                definition: formattedCreationDate!,
                href: proposalCreationUrl,
            },
            {
                term: t('app.plugins.token.tokenPermissionCheckVoteSubmission.membership'),
                definition: `0 ${tokenSymbol}`,
            },
        ],
        isLoading,
    };
};
