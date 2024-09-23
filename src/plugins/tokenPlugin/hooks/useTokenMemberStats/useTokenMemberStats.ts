import { useMember } from '@/modules/governance/api/governanceService';
import { useDaoSettings } from '@/shared/api/daoService';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/ods';
import { formatUnits } from 'viem';
import { type IDaoTokenSettings, type ITokenMember } from '../../types';

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

    const daoSettingsParams = { daoId };
    const { data: daoSettings } = useDaoSettings<IDaoTokenSettings>({ urlParams: daoSettingsParams });

    if (member == null || daoSettings == null) {
        return [];
    }

    const { token } = daoSettings;

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
