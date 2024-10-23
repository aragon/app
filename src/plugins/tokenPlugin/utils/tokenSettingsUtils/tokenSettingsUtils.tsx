import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { DaoTokenVotingMode, type ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type TranslationFunction } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { formatUnits } from 'viem';

export interface IParseTokenSettingsParams {
    /**
     * Settings passed into the function either from the DAO or the proposal.
     */
    settings: ITokenPluginSettings;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class TokenSettingsUtils {
    /**
     * Percentage values for token-based plugin settings are stored values between 0 and 10**6 (defined as RATIO_BASE).
     * The function parses the value set on the blockchain and returns it as percentage value between 0 and 100.
     * (see https://github.com/aragon/osx-commons/blob/main/contracts/src/utils/math/Ratio.sol)
     */
    parsePercentageSetting = (percentage: number) => percentage / 10 ** 4;

    parseSettings = (params: IParseTokenSettingsParams): IDaoSettingTermAndDefinition[] => {
        const { settings, t } = params;
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

        const parsedSupportThreshold = this.parsePercentageSetting(supportThreshold);
        const formattedApproveThreshold = formatterUtils.formatNumber(parsedSupportThreshold / 100, {
            format: NumberFormat.PERCENTAGE_SHORT,
        });

        const parsedMinParticipation = this.parsePercentageSetting(minParticipation);
        const formattedMinParticipation = formatterUtils.formatNumber(parsedMinParticipation / 100, {
            format: NumberFormat.PERCENTAGE_SHORT,
        });

        const minParticipationToken = Math.round((Number(processedTotalSupply) * parsedMinParticipation) / 100);
        const parsedMinParticipationToken = formatUnits(BigInt(minParticipationToken), decimals);
        const formattedMinParticipationToken = formatterUtils.formatNumber(parsedMinParticipationToken, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });

        const duration = Duration.fromObject({ seconds: minDuration }).shiftTo('days', 'hours', 'minutes');
        const formattedDuration = t('app.plugins.token.tokenGovernanceSettings.duration', {
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
                    votingMode === DaoTokenVotingMode.EARLY_EXECUTION
                        ? t('app.plugins.token.tokenGovernanceSettings.yes')
                        : t('app.plugins.token.tokenGovernanceSettings.no'),
            },
            {
                term: t('app.plugins.token.tokenGovernanceSettings.voteChange'),
                definition:
                    votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT
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
}

export const tokenSettingsUtils = new TokenSettingsUtils();
