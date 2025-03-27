import { generateTokenPluginSettings, generateTokenPluginSettingsToken } from '@/plugins/tokenPlugin/testUtils';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { mockTranslations } from '@/test/utils';
import { tokenSettingsUtils } from './tokenSettingsUtils';

describe('tokenSettings utils', () => {
    describe('ratioToPercentage', () => {
        it('correctly parses the percentage setting', () => {
            expect(tokenSettingsUtils.ratioToPercentage(500000)).toEqual(50);
            expect(tokenSettingsUtils.ratioToPercentage(123456)).toEqual(12.3456);
            expect(tokenSettingsUtils.ratioToPercentage(0)).toEqual(0);
            expect(tokenSettingsUtils.ratioToPercentage(1000000)).toEqual(100);
        });
    });

    describe('percentageToRatio', () => {
        it('correctly converts percentage to ratio', () => {
            expect(tokenSettingsUtils.percentageToRatio(50)).toEqual(500000);
            expect(tokenSettingsUtils.percentageToRatio(12.3456)).toEqual(123456);
            expect(tokenSettingsUtils.percentageToRatio(0)).toEqual(0);
            expect(tokenSettingsUtils.percentageToRatio(100)).toEqual(1000000);
        });
    });

    describe('parseSettings', () => {
        it('correctly formats and displays the approval threshold', () => {
            const settings = generateTokenPluginSettings({ supportThreshold: 300000 });
            const result = tokenSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [approvalThresholdTerm] = result;

            expect(approvalThresholdTerm.term).toMatch(/tokenGovernanceSettings.approvalThreshold/);
            expect(approvalThresholdTerm.definition).toMatch(
                /tokenGovernanceSettings.approval \(approvalThreshold=30%\)/,
            );
        });

        it('correctly formats and displays the minimum participation', () => {
            const settings = generateTokenPluginSettings({ minParticipation: 200000 });
            const result = tokenSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, minimumParticipationTerm] = result;

            expect(minimumParticipationTerm.term).toMatch(/tokenGovernanceSettings.minimumParticipation/);
            expect(minimumParticipationTerm.definition).toMatch(
                /tokenGovernanceSettings.participation \(participation=20%,tokenValue=0,tokenSymbol=ETH\)/,
            );
        });

        it('correctly formats and displays the minimum participation token value', () => {
            const settings = generateTokenPluginSettings({
                token: generateTokenPluginSettingsToken({ totalSupply: '200000', decimals: 2 }),
                minParticipation: 200000,
            });
            const result = tokenSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, minimumParticipationTerm] = result;

            expect(minimumParticipationTerm.term).toMatch(/tokenGovernanceSettings.minimumParticipation/);
            expect(minimumParticipationTerm.definition).toMatch(
                /tokenGovernanceSettings.participation \(participation=20%,tokenValue=400,tokenSymbol=ETH\)/,
            );
        });

        it('correctly formats and displays the duration from settings', () => {
            const settings = generateTokenPluginSettings({ minDuration: 60 * 60 * 24 * 7 });
            const result = tokenSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, , durationTerm] = result;

            expect(durationTerm.term).toMatch(/tokenGovernanceSettings.minimumDuration/);
            expect(durationTerm.definition).toMatch(/tokenGovernanceSettings.duration \(days=7,hours=0,minutes=0\)/);
        });

        it('correctly formats and displays the voting power necessary to be a proposer', () => {
            const settings = generateTokenPluginSettings({
                token: generateTokenPluginSettingsToken({ symbol: 'TKN', decimals: 18 }),
                minProposerVotingPower: '100000000000000000000',
            });
            const result = tokenSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, , , , , proposerVotingTerm] = result;

            expect(proposerVotingTerm.term).toMatch(/tokenGovernanceSettings.proposalThreshold/);
            expect(proposerVotingTerm.definition).toMatch(
                /tokenGovernanceSettings.proposalAccess \(balance=100,symbol=TKN\)/,
            );
        });

        it('correctly formats and displays for different voting modes', () => {
            const votingModes = [
                {
                    mode: DaoTokenVotingMode.VOTE_REPLACEMENT,
                    expectedVoteChange: 'app.plugins.token.tokenGovernanceSettings.yes',
                    expectedEarlyExecution: 'app.plugins.token.tokenGovernanceSettings.no',
                },
                {
                    mode: DaoTokenVotingMode.EARLY_EXECUTION,
                    expectedVoteChange: 'app.plugins.token.tokenGovernanceSettings.no',
                    expectedEarlyExecution: 'app.plugins.token.tokenGovernanceSettings.yes',
                },
                {
                    mode: DaoTokenVotingMode.STANDARD,
                    expectedVoteChange: 'app.plugins.token.tokenGovernanceSettings.no',
                    expectedEarlyExecution: 'app.plugins.token.tokenGovernanceSettings.no',
                },
            ];

            votingModes.forEach(({ mode, expectedVoteChange, expectedEarlyExecution }) => {
                const settings = generateTokenPluginSettings({ votingMode: mode });
                const result = tokenSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

                const [, , , earlyExecutionTerm, voteChangeTerm] = result;

                expect(voteChangeTerm.definition).toEqual(expectedVoteChange);
                expect(earlyExecutionTerm.definition).toEqual(expectedEarlyExecution);
            });
        });
    });
});
