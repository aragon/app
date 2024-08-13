import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { formatterUtils, NumberFormat } from '@aragon/ods';
import { formatUnits } from 'viem';
import { tokenSettingsUtils } from './tokenSettingsUtils';

describe('tokenSettings utils', () => {
    describe('parseSettings', () => {
        it('correctly parses the percentage setting', () => {
            expect(tokenSettingsUtils.parsePercentageSetting(500000)).toEqual(50);
            expect(tokenSettingsUtils.parsePercentageSetting(123456)).toEqual(12.3456);
            expect(tokenSettingsUtils.parsePercentageSetting(0)).toEqual(0);
            expect(tokenSettingsUtils.parsePercentageSetting(1000000)).toEqual(100);
        });

        it('correctly formats the approval threshold', () => {
            const parsedSupportThreshold = tokenSettingsUtils.parsePercentageSetting(300000);
            const formattedApproveThreshold = formatterUtils.formatNumber(parsedSupportThreshold / 100, {
                format: NumberFormat.PERCENTAGE_SHORT,
            });
            expect(formattedApproveThreshold).toBe('30%');
        });

        it('correctly formats the minimum participation', () => {
            const parsedMinParticipation = tokenSettingsUtils.parsePercentageSetting(200000);
            const formattedMinParticipation = formatterUtils.formatNumber(parsedMinParticipation / 100, {
                format: NumberFormat.PERCENTAGE_SHORT,
            });
            expect(formattedMinParticipation).toBe('20%');
        });

        it('correctly formats the minimum participation token value', () => {
            const totalSupply = '200000';
            const decimals = 2;
            const parsedMinParticipation = tokenSettingsUtils.parsePercentageSetting(200000);
            const minParticipationToken = (Number(totalSupply) * parsedMinParticipation) / 100;
            const parsedMinParticipationToken = formatUnits(BigInt(minParticipationToken), decimals);
            const formattedMinParticipationToken = formatterUtils.formatNumber(parsedMinParticipationToken, {
                format: NumberFormat.TOKEN_AMOUNT_LONG,
            });
            expect(formattedMinParticipationToken).toBe('400');
        });

        it('correctly formats the duration from settings', () => {
            const settings = generateDaoTokenSettings({
                settings: {
                    minDuration: 604800,
                    supportThreshold: 0,
                    minParticipation: 0,
                    minProposerVotingPower: '0',
                    votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
                },
            });

            const t = (key: string, options?: { days?: number; hours?: number; minutes?: number }) => {
                if (key === 'app.plugins.token.tokenGovernanceSettings.duration') {
                    return `days=${options?.days ?? 0},hours=${options?.hours ?? 0},minutes=${options?.minutes ?? 0}`;
                }
                return key;
            };

            const result = tokenSettingsUtils.parseSettings({ settings, t });

            expect(result).toHaveLength(6);

            const durationTerm = result.find(
                (term) => term.term === 'app.plugins.token.tokenGovernanceSettings.minimumDuration',
            );

            expect(durationTerm?.definition).toBe('days=7,hours=0,minutes=0');
        });

        it('correctly formats the proposer voting power', () => {
            const minProposerVotingPower = '100';
            const decimals = 2;
            const minProposerVotingPowerFullNumber = Number(minProposerVotingPower ?? '0').toLocaleString('fullwide', {
                useGrouping: false,
            });
            const parsedMinVotingPower = formatUnits(BigInt(minProposerVotingPowerFullNumber), decimals);
            const formattedProposerVotingPower = formatterUtils.formatNumber(parsedMinVotingPower, {
                format: NumberFormat.TOKEN_AMOUNT_LONG,
            });
            expect(formattedProposerVotingPower).toBe('1');
        });
    });
});
