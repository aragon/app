import { useMember } from '@/modules/governance/api/governanceService';
import { useDaoSettings } from '@/shared/api/daoService';
import { type IPageHeaderStat } from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils } from '@aragon/ods';
import { formatUnits } from 'viem';
import { type IDaoTokenSettings, type ITokenMember } from '../../types';

interface ITokenMemberParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the DAO member.
     */
    address: string;
}

export const useTokenMemberStats = (params: ITokenMemberParams): IPageHeaderStat[] => {
    const { address, daoId } = params;
    const { t } = useTranslations();

    const memberUrlParams = { address };
    const memberQueryParams = { daoId };
    const { data: member } = useMember<ITokenMember>({
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    });

    const daoSettingsParams = {
        daoId,
    };
    const { data: daoSettings } = useDaoSettings<IDaoTokenSettings>({
        urlParams: daoSettingsParams,
    });

    if (member == null || daoSettings == null) {
        return [];
    }

    const { token } = daoSettings;

    const parsedVotingPower = formatUnits(BigInt(member.votingPower), token.decimals);
    const formattedVotingPower = formatterUtils.formatNumber(parsedVotingPower);

    const parsedTokenBalance = formatUnits(BigInt(member.tokenBalance), token.decimals);
    const formattedTokenBalance = formatterUtils.formatNumber(parsedTokenBalance);

    return [
        {
            label: t('app.governance.plugins.token.tokenMemberStats.votingPower'),
            value: formattedVotingPower,
            suffix: token.symbol,
        },
        {
            label: t('app.governance.plugins.token.tokenMemberStats.tokenBalance'),
            value: formattedTokenBalance,
            suffix: token.symbol,
        },
        {
            label: t('app.governance.plugins.token.tokenMemberStats.delegations'),
            value: member.metrics.delegateReceivedCount,
        },
        {
            // TODO: Display real last activity date (APP-3405)
            label: t('app.governance.plugins.token.tokenMemberStats.latestActivity'),
            value: 3,
            suffix: 'days ago',
        },
    ];
};
