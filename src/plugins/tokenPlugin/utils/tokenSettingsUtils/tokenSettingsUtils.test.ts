import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { mockTranslations } from '@/test/utils';
import { tokenSettingsUtils } from './tokenSettingsUtils';

describe('tokenSettings utils', () => {
    describe('parsePercentageSetting method', () => {
        it('correctly parses the percentage setting', () => {
            expect(tokenSettingsUtils.parsePercentageSetting(500000)).toEqual(50);
            expect(tokenSettingsUtils.parsePercentageSetting(123456)).toEqual(12.3456);
            expect(tokenSettingsUtils.parsePercentageSetting(0)).toEqual(0);
            expect(tokenSettingsUtils.parsePercentageSetting(1000000)).toEqual(100);
        });
    });

    describe('parseSettings method', () => {
        it('correctly formats and displays the approval threshold', () => {
            const baseSettings = generateDaoTokenSettings();
            const mockSettings = {
                ...baseSettings,
                settings: { ...baseSettings.settings, supportThreshold: 300000 },
            };

            const result = tokenSettingsUtils.parseSettings({
                settings: mockSettings,
                t: mockTranslations.tMock,
            });

            const [approvalThresholdTerm] = result;

            expect(approvalThresholdTerm.term).toBe('app.plugins.token.tokenGovernanceSettings.approvalThreshold');
            expect(approvalThresholdTerm.definition).toBe(
                'app.plugins.token.tokenGovernanceSettings.approval (approvalThreshold=30%)',
            );
        });

        it('correctly formats and displays the minimum participation', () => {
            const baseSettings = generateDaoTokenSettings();
            const mockSettings = {
                ...baseSettings,
                settings: { ...baseSettings.settings, minParticipation: 200000 },
            };

            const result = tokenSettingsUtils.parseSettings({
                settings: mockSettings,
                t: mockTranslations.tMock,
            });

            const [, minimumParticipationTerm] = result;

            expect(minimumParticipationTerm.term).toBe(
                'app.plugins.token.tokenGovernanceSettings.minimumParticipation',
            );
            expect(minimumParticipationTerm.definition).toBe(
                'app.plugins.token.tokenGovernanceSettings.participation (participation=20%,tokenValue=0,tokenSymbol=ETH)',
            );
        });

        it('correctly formats and displays the minimum participation token value', () => {
            const baseSettings = generateDaoTokenSettings();
            const mockSettings = {
                ...baseSettings,
                token: {
                    ...baseSettings.token,
                    totalSupply: '200000',
                    decimals: 2,
                },
                settings: {
                    ...baseSettings.settings,
                    minParticipation: 200000,
                },
            };

            const result = tokenSettingsUtils.parseSettings({
                settings: mockSettings,
                t: mockTranslations.tMock,
            });

            const [, minimumParticipationTerm] = result;

            expect(minimumParticipationTerm.term).toBe(
                'app.plugins.token.tokenGovernanceSettings.minimumParticipation',
            );
            expect(minimumParticipationTerm.definition).toBe(
                'app.plugins.token.tokenGovernanceSettings.participation (participation=20%,tokenValue=400,tokenSymbol=ETH)',
            );
        });

        it('correctly formats and displays the duration from settings', () => {
            const baseSettings = generateDaoTokenSettings();
            const mockSettings = {
                ...baseSettings,
                settings: {
                    ...baseSettings.settings,
                    minDuration: 60 * 60 * 24 * 7,
                },
            };

            const result = tokenSettingsUtils.parseSettings({ settings: mockSettings, t: mockTranslations.tMock });

            const [, , durationTerm] = result;

            expect(durationTerm.term).toBe('app.plugins.token.tokenGovernanceSettings.minimumDuration');
            expect(durationTerm.definition).toBe(
                'app.plugins.token.tokenGovernanceSettings.duration (days=7,hours=0,minutes=0)',
            );
        });

        it('correctly formats and displays the voting power necessary to be a proposer', () => {
            const baseSettings = generateDaoTokenSettings();
            const mockSettings = {
                ...baseSettings,
                token: {
                    ...baseSettings.token,
                    symbol: 'TKN',
                    totalSupply: '100000000000000000000',
                    decimals: 18,
                },
                settings: {
                    ...baseSettings.settings,
                    minProposerVotingPower: '100000000000000000000',
                },
            };

            const result = tokenSettingsUtils.parseSettings({ settings: mockSettings, t: mockTranslations.tMock });

            const [, , , , , proposerVotingTerm] = result;

            expect(proposerVotingTerm.term).toBe('app.plugins.token.tokenGovernanceSettings.proposalThreshold');
            expect(proposerVotingTerm.definition).toBe(
                'app.plugins.token.tokenGovernanceSettings.proposalAccess (balance=100,symbol=TKN)',
            );
        });

        it('correctly formats and displays for different voting modes', () => {
            const baseSettings = generateDaoTokenSettings();

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
                const mockSettings = {
                    ...baseSettings,
                    settings: { ...baseSettings.settings, votingMode: mode },
                };

                const result = tokenSettingsUtils.parseSettings({
                    settings: mockSettings,
                    t: mockTranslations.tMock,
                });

                const [, , , earlyExecutionTerm, voteChangeTerm] = result;

                expect(voteChangeTerm.definition).toBe(expectedVoteChange);
                expect(earlyExecutionTerm.definition).toBe(expectedEarlyExecution);
            });
        });
    });
});
