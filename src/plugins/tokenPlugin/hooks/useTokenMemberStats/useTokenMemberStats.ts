import { useMember } from '@/modules/governance/api/governanceService';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { usePluginSettings } from '@/shared/hooks/usePluginSettings';
import { formatterUtils, NumberFormat } from '@aragon/ods';
import { formatUnits } from 'viem';
import { type ITokenMember, type ITokenPluginSettings } from '../../types';

interface IUseTokenMemberStatsParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the DAO member.
     */
    address: string;
}

export const useTokenMemberStats = (params: IUseTokenMemberStatsParams): IPageHeaderStat[] => {
    const { address, daoId } = params;
    const { t } = useTranslations();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId };
    const { data: member } = useMember<ITokenMember>({ urlParams: memberUrlParams, queryParams: memberQueryParams });

    const pluginSettings = usePluginSettings<ITokenPluginSettings>({ daoId });

    if (member == null || pluginSettings == null) {
        return [];
    }

    const { token } = pluginSettings;

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
