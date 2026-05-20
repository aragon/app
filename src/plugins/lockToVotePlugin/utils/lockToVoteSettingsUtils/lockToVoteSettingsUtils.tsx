import {
    formatterUtils,
    type IDefinitionSetting,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { tokenSettingsUtils } from '../../../tokenPlugin/utils/tokenSettingsUtils';
import {
    DaoLockToVoteVotingMode,
    type ILockToVotePluginSettings,
} from '../../types';

export interface IParseLockToVoteSettingsParams {
    /**
     * Settings passed into the function either from the DAO or the proposal.
     */
    settings: ILockToVotePluginSettings;
    /**
     * Total supply of the token (fresh value, fetched in real-time). If not
     * present, only show percentage without token value.
     */
    realTimeTotalSupply?: string;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto?: boolean;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export interface IFormatMinParticipationParams {
    /**
     * Minimum participation expressed as a percentage in the [0, 100] range.
     */
    minParticipationPercentage: number;
    /**
     * Total token supply used to derive the absolute token amount required to
     * meet the participation threshold. Accepts a stringified or numeric value;
     * `undefined`/`null` is treated as `0` so callers can pass live RPC results.
     */
    totalSupply: string | number | bigint | null | undefined;
    /**
     * Token decimals used to format the absolute token amount.
     */
    decimals: number;
}

export interface IFormatMinParticipationResult {
    /**
     * Absolute token amount (in base units) corresponding to the participation
     * percentage applied to `totalSupply`. `0` when supply is unknown.
     */
    minParticipationToken: number;
    /**
     * Participation percentage formatted via `NumberFormat.PERCENTAGE_LONG`.
     */
    formattedMinParticipation: string | null;
    /**
     * Absolute token amount formatted via `NumberFormat.TOKEN_AMOUNT_SHORT`.
     */
    formattedMinParticipationToken: string | null;
}

class LockToVoteSettingsUtils {
    ratioToPercentage = (percentage: number) =>
        tokenSettingsUtils.ratioToPercentage(percentage);

    percentageToRatio = (percentage: number) =>
        tokenSettingsUtils.percentageToRatio(percentage);

    formatMinParticipation = (
        params: IFormatMinParticipationParams,
    ): IFormatMinParticipationResult => {
        const { minParticipationPercentage, totalSupply, decimals } = params;

        const formattedMinParticipation = formatterUtils.formatNumber(
            minParticipationPercentage / 100,
            { format: NumberFormat.PERCENTAGE_LONG },
        );

        const minParticipationToken = Math.round(
            (Number(totalSupply ?? 0) * minParticipationPercentage) / 100,
        );
        const parsedMinParticipationToken = formatUnits(
            bigIntUtils.safeParse(minParticipationToken),
            decimals,
        );
        const formattedMinParticipationToken = formatterUtils.formatNumber(
            parsedMinParticipationToken,
            { format: NumberFormat.TOKEN_AMOUNT_SHORT },
        );

        return {
            minParticipationToken,
            formattedMinParticipation,
            formattedMinParticipationToken,
        };
    };

    parseSettings = (
        params: IParseLockToVoteSettingsParams,
    ): IDefinitionSetting[] => {
        const { settings, isVeto, t, realTimeTotalSupply = '0' } = params;
        const {
            supportThreshold,
            minParticipation,
            minDuration,
            minProposerVotingPower,
            votingMode,
            token,
        } = settings;

        const { symbol: tokenSymbol, decimals } = token;

        const parsedSupportThreshold = this.ratioToPercentage(supportThreshold);
        const formattedApproveThreshold = formatterUtils.formatNumber(
            parsedSupportThreshold / 100,
            {
                format: NumberFormat.PERCENTAGE_SHORT,
            },
        );

        const {
            minParticipationToken,
            formattedMinParticipation,
            formattedMinParticipationToken,
        } = this.formatMinParticipation({
            minParticipationPercentage:
                this.ratioToPercentage(minParticipation),
            totalSupply: realTimeTotalSupply,
            decimals,
        });

        const duration = dateUtils.secondsToDuration(minDuration);
        const formattedDuration = t(
            'app.plugins.lockToVote.lockToVoteGovernanceSettings.duration',
            {
                days: duration.days,
                hours: duration.hours,
                minutes: duration.minutes,
            },
        );

        const parsedMinVotingPower = formatUnits(
            bigIntUtils.safeParse(minProposerVotingPower),
            decimals,
        );
        const formattedProposerVotingPower = formatterUtils.formatNumber(
            parsedMinVotingPower,
            {
                format: NumberFormat.TOKEN_AMOUNT_LONG,
            },
        );

        return [
            {
                term: t(
                    `app.plugins.lockToVote.lockToVoteGovernanceSettings.${isVeto ? 'vetoThreshold' : 'approvalThreshold'}`,
                ),
                definition: t(
                    'app.plugins.lockToVote.lockToVoteGovernanceSettings.threshold',
                    {
                        threshold: formattedApproveThreshold,
                    },
                ),
            },
            {
                term: t(
                    'app.plugins.lockToVote.lockToVoteGovernanceSettings.minimumParticipation',
                ),
                definition:
                    minParticipationToken === 0
                        ? t(
                              'app.plugins.lockToVote.lockToVoteGovernanceSettings.participationNoToken',
                              {
                                  participation: formattedMinParticipation,
                              },
                          )
                        : t(
                              'app.plugins.lockToVote.lockToVoteGovernanceSettings.participation',
                              {
                                  participation: formattedMinParticipation,
                                  tokenValue: formattedMinParticipationToken,
                                  tokenSymbol,
                              },
                          ),
            },
            {
                term: t(
                    'app.plugins.lockToVote.lockToVoteGovernanceSettings.proposalDuration',
                ),
                definition: formattedDuration,
            },
            {
                term: t(
                    'app.plugins.lockToVote.lockToVoteGovernanceSettings.voteChange',
                ),
                definition:
                    votingMode === DaoLockToVoteVotingMode.VOTE_REPLACEMENT
                        ? t(
                              'app.plugins.lockToVote.lockToVoteGovernanceSettings.yes',
                          )
                        : t(
                              'app.plugins.lockToVote.lockToVoteGovernanceSettings.no',
                          ),
            },
            {
                term: t(
                    'app.plugins.lockToVote.lockToVoteGovernanceSettings.proposalThreshold',
                ),
                definition: t(
                    'app.plugins.lockToVote.lockToVoteGovernanceSettings.proposalAccess',
                    {
                        balance: formattedProposerVotingPower,
                        symbol: tokenSymbol,
                    },
                ),
            },
        ];
    };
}

export const lockToVoteSettingsUtils = new LockToVoteSettingsUtils();
