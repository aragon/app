import { mockTranslations } from '@/test/utils';
import { generateLockToVotePluginSettings } from '../../testUtils/generators/lockToVotePluginSettings';
import { generateLockToVotePluginSettingsToken } from '../../testUtils/generators/lockToVotePluginSettingsToken';
import { DaoLockToVoteVotingMode } from '../../types';
import { lockToVoteSettingsUtils } from './lockToVoteSettingsUtils';

describe('lockToVoteSettings utils', () => {
    describe('parseSettings', () => {
        it('correctly formats and displays the approval threshold', () => {
            const settings = generateLockToVotePluginSettings({ supportThreshold: 300_000 });
            const result = lockToVoteSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [approvalThresholdTerm] = result;

            expect(approvalThresholdTerm.term).toMatch(/lockToVoteGovernanceSettings.approvalThreshold/);
            expect(approvalThresholdTerm.definition).toMatch(/lockToVoteGovernanceSettings.threshold \(threshold=30%\)/);
        });

        it('correctly formats and displays the minimum participation', () => {
            const settings = generateLockToVotePluginSettings({ minParticipation: 123_456 });
            const result = lockToVoteSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, minimumParticipationTerm] = result;

            expect(minimumParticipationTerm.term).toMatch(/lockToVoteGovernanceSettings.minimumParticipation/);
            expect(minimumParticipationTerm.definition).toMatch(
                /lockToVoteGovernanceSettings.participation \(participation=12\.35%,tokenValue=0,tokenSymbol=ETH\)/
            );
        });

        it('correctly formats and displays the minimum participation token value', () => {
            const settings = generateLockToVotePluginSettings({
                token: generateLockToVotePluginSettingsToken({ totalSupply: '200000', decimals: 2 }),
                minParticipation: 200_000,
            });
            const result = lockToVoteSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, minimumParticipationTerm] = result;

            expect(minimumParticipationTerm.term).toMatch(/lockToVoteGovernanceSettings.minimumParticipation/);
            expect(minimumParticipationTerm.definition).toMatch(
                /lockToVoteGovernanceSettings.participation \(participation=20\.00%,tokenValue=400,tokenSymbol=ETH\)/
            );
        });

        it('correctly formats and displays the duration from settings', () => {
            const settings = generateLockToVotePluginSettings({ minDuration: 60 * 60 * 24 * 7 });
            const result = lockToVoteSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, , durationTerm] = result;

            expect(durationTerm.term).toMatch(/lockToVoteGovernanceSettings.proposalDuration/);
            expect(durationTerm.definition).toMatch(/lockToVoteGovernanceSettings.duration \(days=7,hours=0,minutes=0\)/);
        });

        it('correctly formats and displays the voting power necessary to be a proposer', () => {
            const settings = generateLockToVotePluginSettings({
                token: generateLockToVotePluginSettingsToken({ symbol: 'TKN', decimals: 18 }),
                minProposerVotingPower: '100000000000000000000',
            });
            const result = lockToVoteSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

            const [, , , , proposerVotingTerm] = result;

            expect(proposerVotingTerm.term).toMatch(/lockToVoteGovernanceSettings.proposalThreshold/);
            expect(proposerVotingTerm.definition).toMatch(/lockToVoteGovernanceSettings.proposalAccess \(balance=100,symbol=TKN\)/);
        });

        it('correctly formats and displays for different voting modes', () => {
            const votingModes = [
                {
                    mode: DaoLockToVoteVotingMode.VOTE_REPLACEMENT,
                    expectedVoteChange: 'app.plugins.lockToVote.lockToVoteGovernanceSettings.yes',
                },
                {
                    mode: DaoLockToVoteVotingMode.STANDARD,
                    expectedVoteChange: 'app.plugins.lockToVote.lockToVoteGovernanceSettings.no',
                },
            ] as const;

            votingModes.forEach(({ mode, expectedVoteChange }) => {
                const settings = generateLockToVotePluginSettings({ votingMode: mode });
                const result = lockToVoteSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });

                const [, , , voteChangeTerm] = result;

                expect(voteChangeTerm.definition).toEqual(expectedVoteChange);
            });
        });
    });
});
