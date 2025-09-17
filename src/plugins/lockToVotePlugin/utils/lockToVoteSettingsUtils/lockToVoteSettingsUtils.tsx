import { type TranslationFunction } from '@/shared/components/translationsProvider';
import { dateUtils } from '@/shared/utils/dateUtils';
import { formatterUtils, type IDefinitionSetting, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { tokenSettingsUtils } from '../../../tokenPlugin/utils/tokenSettingsUtils';
import { DaoLockToVoteVotingMode, type ILockToVotePluginSettings } from '../../types';

export interface IParseLockToVoteSettingsParams {
    /**
     * Settings passed into the function either from the DAO or the proposal.
     */
    settings: ILockToVotePluginSettings;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto?: boolean;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class LockToVoteSettingsUtils {
    ratioToPercentage = (percentage: number) => tokenSettingsUtils.ratioToPercentage(percentage);

    percentageToRatio = (percentage: number) => tokenSettingsUtils.percentageToRatio(percentage);

    parseSettings = (params: IParseLockToVoteSettingsParams): IDefinitionSetting[] => {
        const { settings, isVeto, t } = params;
        const {
            supportThreshold,
            minParticipation,
            minDuration,
            minProposerVotingPower,
            votingMode,
            token,
            historicalTotalSupply,
        } = settings;

        const { symbol: tokenSymbol, totalSupply, decimals } = token;

        const processedTotalSupply = historicalTotalSupply ?? totalSupply;

        const parsedSupportThreshold = this.ratioToPercentage(supportThreshold);
        const formattedApproveThreshold = formatterUtils.formatNumber(parsedSupportThreshold / 100, {
            format: NumberFormat.PERCENTAGE_SHORT,
        });

        const parsedMinParticipation = this.ratioToPercentage(minParticipation);
        const formattedMinParticipation = formatterUtils.formatNumber(parsedMinParticipation / 100, {
            format: NumberFormat.PERCENTAGE_LONG,
        });

        const minParticipationToken = Math.round((Number(processedTotalSupply) * parsedMinParticipation) / 100);
        const parsedMinParticipationToken = formatUnits(BigInt(minParticipationToken), decimals);
        const formattedMinParticipationToken = formatterUtils.formatNumber(parsedMinParticipationToken, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });

        const duration = dateUtils.secondsToDuration(minDuration);
        const formattedDuration = t('app.plugins.lockToVote.lockToVoteGovernanceSettings.duration', {
            days: duration.days,
            hours: duration.hours,
            minutes: duration.minutes,
        });

        const parsedMinVotingPower = formatUnits(BigInt(minProposerVotingPower), decimals);
        const formattedProposerVotingPower = formatterUtils.formatNumber(parsedMinVotingPower, {
            format: NumberFormat.TOKEN_AMOUNT_LONG,
        });

        return [
            {
                term: t(
                    `app.plugins.lockToVote.lockToVoteGovernanceSettings.${isVeto ? 'vetoThreshold' : 'approvalThreshold'}`,
                ),
                definition: t('app.plugins.lockToVote.lockToVoteGovernanceSettings.threshold', {
                    threshold: formattedApproveThreshold,
                }),
            },
            {
                term: t('app.plugins.lockToVote.lockToVoteGovernanceSettings.minimumParticipation'),
                definition: t('app.plugins.lockToVote.lockToVoteGovernanceSettings.participation', {
                    participation: formattedMinParticipation,
                    tokenValue: formattedMinParticipationToken,
                    tokenSymbol,
                }),
            },
            {
                term: t('app.plugins.lockToVote.lockToVoteGovernanceSettings.proposalDuration'),
                definition: formattedDuration,
            },
            {
                term: t('app.plugins.lockToVote.lockToVoteGovernanceSettings.voteChange'),
                definition:
                    votingMode === DaoLockToVoteVotingMode.VOTE_REPLACEMENT
                        ? t('app.plugins.lockToVote.lockToVoteGovernanceSettings.yes')
                        : t('app.plugins.lockToVote.lockToVoteGovernanceSettings.no'),
            },
            {
                term: t('app.plugins.lockToVote.lockToVoteGovernanceSettings.proposalThreshold'),
                definition: t('app.plugins.lockToVote.lockToVoteGovernanceSettings.proposalAccess', {
                    balance: formattedProposerVotingPower,
                    symbol: tokenSymbol,
                }),
            },
        ];
    };
}

export const lockToVoteSettingsUtils = new LockToVoteSettingsUtils();
