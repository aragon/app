import { type IProposal, useMember } from '@/modules/governance/api/governanceService';
import type { IUseCheckPermissionGuardBaseParams } from '@/modules/governance/hooks/usePermissionCheckGuard/usePermissionCheckGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { ITokenMember, ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ChainEntityType, DateFormat, formatterUtils, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface ITokenPermissionCheckVoteSubmissionParams extends IUseCheckPermissionGuardBaseParams {
    /**
     * Plugin to create the proposal for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * Proposal to create the vote for.
     */
    proposal: IProposal;
    /**
     * ID of the chain the proposal is created on.
     */
    chainId: number;
}

export const useTokenPermissionCheckVoteSubmission = (
    params: ITokenPermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId, proposal, chainId } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const tokenSymbol = plugin.settings.token.symbol;

    const memberUrlParams = { address: address as string };
    const memberQueryParams = { daoId, pluginAddress: plugin.address };
    const { data: member, isLoading } = useMember<ITokenMember>({
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    });

    const hasPermission = member?.votingPower != null;

    const formattedCreationDate = formatterUtils.formatDate(proposal.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: proposal.transactionHash });

    const proposalCreationLink = () => {
        return (
            <Link href={proposalCreationUrl} iconRight={IconType.LINK_EXTERNAL}>
                {formattedCreationDate}
            </Link>
        );
    };

    if (hasPermission) {
        return {
            hasPermission: true,
            settings: [],
            isLoading,
        };
    }

    return {
        hasPermission: false,
        settings: [
            {
                term: t('app.plugins.token.tokenVoteSubmissionRequirements.createdAt'),
                definition: proposalCreationLink(),
            },
            {
                term: t('app.plugins.token.tokenVoteSubmissionRequirements.membership'),
                definition: `0 ${tokenSymbol}`,
            },
        ],
        isLoading,
    };
};
