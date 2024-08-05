import { DaoTokenVotingMode, type IDaoTokenSettings } from '@/plugins/tokenPlugin/types';
import { useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/ods';
import { Duration } from 'luxon';
import { formatUnits } from 'viem';
import type { IDaoSettingTermAndDefinition } from '../../../../modules/settings/types';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

interface IUseTokenGovernanceSettingsParams {
    /**
     * ID of the Dao.
     */
    daoId: string;
    /**
     * Settings of the token based Dao.
     */
    settings?: IDaoTokenSettings;
}

export const useTokenGovernanceSettings = (
    params: IUseTokenGovernanceSettingsParams,
): IDaoSettingTermAndDefinition[] => {
    const { daoId, settings } = params;

    const { t } = useTranslations();

    const daoSettingsParams = { daoId };
    const { data: currentSettings } = useDaoSettings<IDaoTokenSettings>(
        { urlParams: daoSettingsParams },
        { enabled: settings == null },
    );

    const processedSettings = settings ?? currentSettings;

    if (!processedSettings) {
        return [];
    }

    const { supportThreshold, minParticipation, minDuration, minProposerVotingPower } = processedSettings.settings;
    const { symbol: tokenSymbol, totalSupply, decimals } = processedSettings.token;

    const parsedSupportThreshold = tokenSettingsUtils.parsePercentageSetting(supportThreshold);
    const formattedApproveThreshold = formatterUtils.formatNumber(parsedSupportThreshold / 100, {
        format: NumberFormat.PERCENTAGE_SHORT,
    });

    const parsedMinParticipation = tokenSettingsUtils.parsePercentageSetting(minParticipation);
    const formattedMinParticipation = formatterUtils.formatNumber(parsedMinParticipation / 100, {
        format: NumberFormat.PERCENTAGE_SHORT,
    });

    const minParticipationToken = (Number(totalSupply) * parsedMinParticipation) / 100;
    const parsedMinParticipationToken = formatUnits(BigInt(minParticipationToken), decimals);
    const formattedMinParticipationToken = formatterUtils.formatNumber(parsedMinParticipationToken, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
    });

    const duration = Duration.fromObject({ seconds: minDuration }).shiftTo('days', 'hours', 'minutes');
    const formattedDuration = t('app.plugins.token.tokenGovernanceSettings.duration', {
        days: duration.days,
        hours: duration.hours,
        minutes: duration.minutes,
    });

    // TODO: to be removed when backend returns numbers without scientific notation (APP-3480)
    const minProposerVotingPowerFullNumber = Number(minProposerVotingPower ?? '0').toLocaleString('fullwide', {
        useGrouping: false,
    });
    const parsedMinVotingPower = formatUnits(BigInt(minProposerVotingPowerFullNumber), decimals);
    const formattedProposerVotingPower = formatterUtils.formatNumber(parsedMinVotingPower, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
    });

    return [
        {
            term: t('app.plugins.token.tokenGovernanceSettings.approvalThreshold'),
            definition: t('app.plugins.token.tokenGovernanceSettings.approval', {
                approvalThreshold: formattedApproveThreshold,
            }),
        },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.minimumParticipation'),
            definition: t('app.plugins.token.tokenGovernanceSettings.participation', {
                participation: formattedMinParticipation,
                tokenValue: formattedMinParticipationToken,
                tokenSymbol,
            }),
        },
        { term: t('app.plugins.token.tokenGovernanceSettings.minimumDuration'), definition: formattedDuration },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.earlyExecution'),
            definition:
                processedSettings.settings.votingMode === DaoTokenVotingMode.EARLY_EXECUTION
                    ? t('app.plugins.token.tokenGovernanceSettings.yes')
                    : t('app.plugins.token.tokenGovernanceSettings.no'),
        },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.voteChange'),
            definition:
                processedSettings.settings.votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT
                    ? t('app.plugins.token.tokenGovernanceSettings.yes')
                    : t('app.plugins.token.tokenGovernanceSettings.no'),
        },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.proposalThreshold'),
            definition: t('app.plugins.token.tokenGovernanceSettings.proposalAccess', {
                balance: formattedProposerVotingPower,
                symbol: tokenSymbol,
            }),
        },
    ];
};
