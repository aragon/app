import { useMember } from '@/modules/governance/api/governanceService';
import { useCanCreateProposal } from '@/modules/governance/api/governanceService/queries/useCanCreateProposal';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { ITokenMember, ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type Network, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

export interface ITokenPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams<ITokenPluginSettings> {}

export const useTokenPermissionCheckProposalCreation = (
    params: ITokenPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId } = params;

    const { address } = useAccount();
    const { t } = useTranslations();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const pluginName = daoUtils.getPluginName(plugin);

    const { minProposerVotingPower, token } = plugin.settings;
    const { decimals: tokenDecimals, symbol: tokenSymbol } = token;

    const parsedMinVotingPower = formatUnits(BigInt(minProposerVotingPower), tokenDecimals);
    const formattedMinVotingPower = formatterUtils.formatNumber(parsedMinVotingPower, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const minTokenRequired = `${formattedMinVotingPower ?? '0'} ${tokenSymbol}`;

    const memberUrlParams = { address: address as string };
    const memberQueryParams = { daoId, pluginAddress: plugin.address };
    const { data: member, isLoading } = useMember<ITokenMember>(
        { urlParams: memberUrlParams, queryParams: memberQueryParams },
        { enabled: address != null },
    );

    // As the GET /member endpoint returns outdated balance and/or voting power in some scenarios, here we use the
    // GET /can-create-proposal endpoint which fetches the user balance on the fly (to be removed, APP-4261)
    const checkQueryParams = {
        memberAddress: address as string,
        pluginAddress: plugin.address,
        network: dao?.network as Network,
    };
    const { data: canCreateProposal } = useCanCreateProposal(
        { queryParams: checkQueryParams },
        { enabled: address != null && dao != null },
    );

    const userVotingPower = BigInt(member?.votingPower ?? '0');
    const userBalance = BigInt(member?.tokenBalance ?? '0');

    const parsedMemberVotingPower = formatUnits(userVotingPower, tokenDecimals);
    const formattedMemberVotingPower = formatterUtils.formatNumber(parsedMemberVotingPower, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const parsedMemberBalance = formatUnits(userBalance, tokenDecimals);
    const formattedMemberBalance = formatterUtils.formatNumber(parsedMemberBalance, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const settings = [
        {
            term: t('app.plugins.token.tokenPermissionCheckProposalCreation.pluginNameLabel'),
            definition: pluginName,
        },
        {
            term: t('app.plugins.token.tokenPermissionCheckProposalCreation.function'),
            definition: `≥${minTokenRequired}`,
        },
        {
            term: t('app.plugins.token.tokenPermissionCheckProposalCreation.userVotingPower'),
            definition: `${formattedMemberVotingPower ?? '0'} ${tokenSymbol}`,
        },
        {
            term: t('app.plugins.token.tokenPermissionCheckProposalCreation.userTokenBalance'),
            definition: `${formattedMemberBalance ?? '0'} ${tokenSymbol}`,
        },
    ];

    const isRestricted = BigInt(minProposerVotingPower) > 0;

    return {
        hasPermission: Boolean(canCreateProposal),
        settings: [settings],
        isLoading,
        isRestricted,
    };
};
