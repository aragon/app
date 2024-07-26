import type { IDaoTokenSettings } from '@/plugins/tokenPlugin/types';
import { useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/ods';
import { Duration } from 'luxon';
import type { IDaoSettingTermAndDefinition } from '../../../../../modules/settings/types';

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

    const tokenSymbol = processedSettings.token.symbol;
    const formattedApproveThreshold = formatterUtils.formatNumber(processedSettings.settings.supportThreshold, {
        format: NumberFormat.PERCENTAGE_LONG,
    });
    const formattedMinParticipation = formatterUtils.formatNumber(processedSettings.settings.supportThreshold, {
        format: NumberFormat.PERCENTAGE_LONG,
    });
    const formattedMinParticipationToken = formatterUtils.formatNumber(processedSettings.settings.minParticipation, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
    });
    const durationInSeconds = processedSettings.settings.minDuration ?? 0;
    const duration = Duration.fromObject({ seconds: durationInSeconds }).shiftTo('days', 'hours', 'minutes');
    const formattedDuration = t('app.plugins.token.tokenGovernanceSettings.duration', {
        days: duration.days,
        hours: duration.hours,
        minutes: duration.minutes,
    });
    const formattedProposerVotingPower = formatterUtils.formatNumber(
        processedSettings.settings.minProposerVotingPower,
        { format: NumberFormat.TOKEN_AMOUNT_LONG },
    );

    return [
        {
            term: t('app.plugins.token.tokenGovernanceSettings.approvalThreshold'),
            definition: t('app.plugins.token.tokenGovernanceSettings.approval', {
                approvalThreshold: formattedApproveThreshold ?? '',
                tokenValue: formattedMinParticipationToken ?? '',
                tokenSymbol,
            }),
        },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.minimumParticipation'),
            definition: t('app.plugins.token.tokenGovernanceSettings.participation', {
                participation: formattedMinParticipation ?? '',
            }),
        },
        { term: t('app.plugins.token.tokenGovernanceSettings.minimumDuration'), definition: formattedDuration },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.earlyExecution'),
            definition:
                processedSettings.settings.votingMode === 1
                    ? t('app.plugins.token.tokenGovernanceSettings.yes')
                    : t('app.plugins.token.tokenGovernanceSettings.no'),
        },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.voteChange'),
            definition: `${processedSettings.settings.votingMode === 2 ? t('app.plugins.token.tokenGovernanceSettings.yes') : t('app.plugins.token.tokenGovernanceSettings.no')}`,
        },
        {
            term: t('app.plugins.token.tokenGovernanceSettings.proposalThreshold'),
            definition: t('app.plugins.token.tokenGovernanceSettings.proposalAccess', {
                balance: formattedProposerVotingPower ?? '',
                symbol: tokenSymbol,
            }),
        },
    ];
};
