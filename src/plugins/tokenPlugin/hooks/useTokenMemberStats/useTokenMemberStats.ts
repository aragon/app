import { useMember, type IMember } from '@/modules/governance/api/governanceService';
import type { IUsePluginMemberStatsParams } from '@/modules/governance/types';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { ITokenMember, ITokenPluginSettings } from '../../types';

export interface IUseTokenMemberStatsParams extends IUsePluginMemberStatsParams<ITokenPluginSettings> {}

const isTokenMember = (member?: IMember): member is ITokenMember =>
    member != null &&
    (('tokenBalance' in member && member.tokenBalance != null) ||
        ('votingPower' in member && member.votingPower != null));

export const useTokenMemberStats = (params: IUseTokenMemberStatsParams): IPageHeaderStat[] => {
    const { address, daoId, plugin } = params;
    const { t } = useTranslations();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId, pluginAddress: plugin.address };
    const { data: member } = useMember({ urlParams: memberUrlParams, queryParams: memberQueryParams });

    if (!isTokenMember(member)) {
        return [];
    }

    const { token } = plugin.settings;

    const parsedVotingPower = formatUnits(BigInt(member.votingPower ?? '0'), token.decimals);
    const formattedVotingPower = formatterUtils.formatNumber(parsedVotingPower, { format: NumberFormat.GENERIC_SHORT });

    const parsedTokenBalance = formatUnits(BigInt(member.tokenBalance ?? '0'), token.decimals);
    const formattedTokenBalance = formatterUtils.formatNumber(parsedTokenBalance, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const formattedDelegations = formatterUtils.formatNumber(member.metrics.delegateReceivedCount, {
        format: NumberFormat.GENERIC_SHORT,
    });

    return [
        {
            label: t('app.plugins.token.tokenMemberStats.votingPower'),
            value: formattedVotingPower,
            suffix: token.symbol,
        },
        {
            label: t('app.plugins.token.tokenMemberStats.tokenBalance'),
            value: formattedTokenBalance,
            suffix: token.symbol,
        },
        {
            label: t('app.plugins.token.tokenMemberStats.delegations'),
            value: formattedDelegations,
        },
    ];
};
