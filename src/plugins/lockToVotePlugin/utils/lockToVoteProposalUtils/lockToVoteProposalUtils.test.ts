import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { generateTokenPluginSettingsToken } from '@/plugins/tokenPlugin/testUtils';
import { timeUtils } from '@/test/utils';
import {
    type ITokenProposalOptionVotes,
    VoteOption,
} from '../../../tokenPlugin/types';
import { generateLockToVotePluginSettings } from '../../testUtils/generators/lockToVotePluginSettings';
import { generateLockToVoteProposal } from '../../testUtils/generators/lockToVoteProposal';
import type { ILockToVoteProposal } from '../../types';
import { lockToVoteProposalUtils } from './lockToVoteProposalUtils';

describe('lockToVoteProposalUtils', () => {
    describe('getProposalStatus', () => {
        const isApprovalReachedSpy = jest.spyOn(
            lockToVoteProposalUtils,
            'isApprovalReached',
        );

        afterEach(() => {
            isApprovalReachedSpy.mockReset();
        });

        afterAll(() => {
            isApprovalReachedSpy.mockRestore();
        });

        it('returns executed status when proposal has been executed', () => {
            const proposal = generateLockToVoteProposal({
                executed: { status: true },
                settings: generateLockToVotePluginSettings({
                    historicalTotalSupply: '0',
                }),
            });
            expect(lockToVoteProposalUtils.getProposalStatus(proposal)).toEqual(
                ProposalStatus.EXECUTED,
            );
        });

        it('returns pending status when proposal has not started yet', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO(
                '2022-02-10T08:00:00.000Z',
            ).toSeconds();
            const proposal = generateLockToVoteProposal({ startDate });
            timeUtils.setTime(now);
            expect(lockToVoteProposalUtils.getProposalStatus(proposal)).toEqual(
                ProposalStatus.PENDING,
            );
        });

        it('returns executable status when approval is reached, proposal is ended and has actions', () => {
            const now = '2022-02-10T08:00:00.868Z';
            const startDate = DateTime.fromISO(
                '2022-02-05T08:00:00.000Z',
            ).toSeconds();
            const endDate = DateTime.fromISO(
                '2022-02-08T08:00:00.000Z',
            ).toSeconds();
            const proposal = generateLockToVoteProposal({
                startDate,
                endDate,
                hasActions: true,
            });
            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(true);
            expect(lockToVoteProposalUtils.getProposalStatus(proposal)).toEqual(
                ProposalStatus.EXECUTABLE,
            );
        });

        it('returns active status when proposal has not ended yet', () => {
            const now = '2022-02-10T08:00:00.868Z';
            const startDate = DateTime.fromISO(
                '2022-02-05T08:00:00.000Z',
            ).toSeconds();
            const endDate = DateTime.fromISO(
                '2022-02-12T08:00:00.000Z',
            ).toSeconds();
            const proposal = generateLockToVoteProposal({ startDate, endDate });
            timeUtils.setTime(now);
            expect(lockToVoteProposalUtils.getProposalStatus(proposal)).toEqual(
                ProposalStatus.ACTIVE,
            );
        });

        it('returns accepted status when proposal is ended, the approval has been reached and proposal is signaling', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO(
                '2024-10-08T09:49:56.868Z',
            ).toSeconds();
            const endDate = DateTime.fromISO(
                '2024-10-12T09:49:56.868Z',
            ).toSeconds();
            const proposal = generateLockToVoteProposal({
                startDate,
                endDate,
                hasActions: false,
            });
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(lockToVoteProposalUtils.getProposalStatus(proposal)).toEqual(
                ProposalStatus.ACCEPTED,
            );
        });

        it('returns rejected status when proposal is ended and the approval has not been reached', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO(
                '2024-10-08T09:49:56.868Z',
            ).toSeconds();
            const endDate = DateTime.fromISO(
                '2024-10-12T09:49:56.868Z',
            ).toSeconds();
            const proposal = generateLockToVoteProposal({ startDate, endDate });
            isApprovalReachedSpy.mockReturnValue(false);
            timeUtils.setTime(now);
            expect(lockToVoteProposalUtils.getProposalStatus(proposal)).toEqual(
                ProposalStatus.REJECTED,
            );
        });
    });

    describe('isApprovalReached', () => {
        const isMinParticipationReachedSpy = jest.spyOn(
            lockToVoteProposalUtils,
            'isMinParticipationReached',
        );
        const isSupportReachedSpy = jest.spyOn(
            lockToVoteProposalUtils,
            'isSupportReached',
        );

        afterEach(() => {
            isMinParticipationReachedSpy.mockReset();
            isSupportReachedSpy.mockReset();
        });

        afterAll(() => {
            isMinParticipationReachedSpy.mockRestore();
            isSupportReachedSpy.mockRestore();
        });

        it('returns true when both minParticipation and support are reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(true);
            isSupportReachedSpy.mockReturnValue(true);
            expect(
                lockToVoteProposalUtils.isApprovalReached(
                    generateLockToVoteProposal(),
                ),
            ).toBeTruthy();
        });

        it('returns false when minParticipation is reached but support is not reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(true);
            isSupportReachedSpy.mockReturnValue(false);
            expect(
                lockToVoteProposalUtils.isApprovalReached(
                    generateLockToVoteProposal(),
                ),
            ).toBe(false);
        });

        it('returns false when support is reached but minParticipation is not reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(false);
            isSupportReachedSpy.mockReturnValue(true);
            expect(
                lockToVoteProposalUtils.isApprovalReached(
                    generateLockToVoteProposal(),
                ),
            ).toBeFalsy();
        });

        it('returns false when both support and minParticipation are not reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(false);
            isSupportReachedSpy.mockReturnValue(false);
            expect(
                lockToVoteProposalUtils.isApprovalReached(
                    generateLockToVoteProposal(),
                ),
            ).toBeFalsy();
        });
    });

    describe('isMinParticipationReached', () => {
        const getTotalVotesSpy = jest.spyOn(
            lockToVoteProposalUtils,
            'getTotalVotes',
        );

        afterEach(() => {
            getTotalVotesSpy.mockReset();
        });

        afterAll(() => {
            getTotalVotesSpy.mockRestore();
        });

        it('returns true when total votes is greater than min participation required', () => {
            const settings = generateLockToVotePluginSettings({
                minParticipation: 150_000,
                historicalTotalSupply: '1000',
            }); // 15%
            const totalVotes = BigInt('200'); // 20% of total-supply
            const proposal = generateLockToVoteProposal({ settings });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(
                lockToVoteProposalUtils.isMinParticipationReached(proposal),
            ).toBeTruthy();
        });

        it('returns true when total votes is equal to min participation required', () => {
            const settings = generateLockToVotePluginSettings({
                minParticipation: 500_000,
                historicalTotalSupply: '1000',
            }); // 50%
            const totalVotes = BigInt('500'); // 50% of total-supply
            const proposal = generateLockToVoteProposal({ settings });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(
                lockToVoteProposalUtils.isMinParticipationReached(proposal),
            ).toBeTruthy();
        });

        it('returns false when total votes is less than min participation required', () => {
            const settings = generateLockToVotePluginSettings({
                minParticipation: 300_000,
                historicalTotalSupply: '1000',
            }); // 30%
            const totalVotes = BigInt('290'); // 29% of total-supply
            const proposal = generateLockToVoteProposal({ settings });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(
                lockToVoteProposalUtils.isMinParticipationReached(proposal),
            ).toBeFalsy();
        });

        it('returns false when total supply is set to zero', () => {
            const settings = generateLockToVotePluginSettings({
                historicalTotalSupply: '0',
            });
            const proposal = generateLockToVoteProposal({ settings });
            expect(
                lockToVoteProposalUtils.isMinParticipationReached(proposal),
            ).toBeFalsy();
        });

        it('supports decimal values for the min-participation setting', () => {
            const settings = generateLockToVotePluginSettings({
                minParticipation: 5000,
                historicalTotalSupply: '1000',
            }); // 0.5%
            const proposal = generateLockToVoteProposal({ settings });
            getTotalVotesSpy.mockReturnValueOnce(BigInt('5')); // 0.5% of total-supply
            expect(
                lockToVoteProposalUtils.isMinParticipationReached(proposal),
            ).toBeTruthy();
            getTotalVotesSpy.mockReturnValueOnce(BigInt('4')); // 0.4% of total-supply
            expect(
                lockToVoteProposalUtils.isMinParticipationReached(proposal),
            ).toBeFalsy();
        });
    });

    describe('isSupportReached', () => {
        it('returns true when the amount of yes votes is greater than the support required', () => {
            const settings = generateLockToVotePluginSettings({
                supportThreshold: 500_000,
                historicalTotalSupply: '0',
            }); // 50%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '510' }, // 51%
                { type: VoteOption.NO, totalVotingPower: '490' }, // 49%
                { type: VoteOption.ABSTAIN, totalVotingPower: '290' },
            ];
            const proposal = generateLockToVoteProposal({
                settings,
                metrics: { votesByOption },
            });
            expect(
                lockToVoteProposalUtils.isSupportReached(proposal),
            ).toBeTruthy();
        });

        it('returns false when the amount of yes votes is equal to the support required', () => {
            const settings = generateLockToVotePluginSettings({
                supportThreshold: 600_000,
                historicalTotalSupply: '0',
            }); // 60%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '600' }, // 60%
                { type: VoteOption.NO, totalVotingPower: '400' }, // 40%
            ];
            const proposal = generateLockToVoteProposal({
                settings,
                metrics: { votesByOption },
            });
            expect(
                lockToVoteProposalUtils.isSupportReached(proposal),
            ).toBeFalsy();
        });

        it('returns false when the amount of yes votes is less than the support required', () => {
            const settings = generateLockToVotePluginSettings({
                supportThreshold: 400_000,
                historicalTotalSupply: '0',
            }); // 40%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '380' }, // 38%
                { type: VoteOption.NO, totalVotingPower: '620' }, // 62%
            ];
            const proposal = generateLockToVoteProposal({
                settings,
                metrics: { votesByOption },
            });
            expect(
                lockToVoteProposalUtils.isSupportReached(proposal),
            ).toBeFalsy();
        });

        it('returns false when no one voted yet', () => {
            const settings = generateLockToVotePluginSettings({
                historicalTotalSupply: '0',
            });
            expect(
                lockToVoteProposalUtils.isSupportReached(
                    generateLockToVoteProposal({ settings }),
                ),
            ).toBeFalsy();
        });
    });

    describe('getTotalVotes', () => {
        it('returns the total amount of voting power for each option', () => {
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '510' },
                { type: VoteOption.NO, totalVotingPower: '7100' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '122' },
            ];
            const proposal = generateLockToVoteProposal({
                metrics: { votesByOption },
            });
            expect(lockToVoteProposalUtils.getTotalVotes(proposal)).toEqual(
                BigInt('7732'),
            );
        });

        it('returns zero when no one has voted yet', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [];
            const proposal = generateLockToVoteProposal({
                metrics: { votesByOption },
            });
            expect(lockToVoteProposalUtils.getTotalVotes(proposal)).toEqual(
                BigInt('0'),
            );
        });

        it('excludes the abstain votes when excludeAbstain parameter is set to true', () => {
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '15' },
                { type: VoteOption.NO, totalVotingPower: '40' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '80' },
            ];
            const proposal = generateLockToVoteProposal({
                metrics: { votesByOption },
            });
            expect(
                lockToVoteProposalUtils.getTotalVotes(proposal, true),
            ).toEqual(BigInt('55'));
        });
    });

    describe('getVoteByType', () => {
        it('returns the voting power of the specified vote type', () => {
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '1510' },
                { type: VoteOption.NO, totalVotingPower: '7145' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '132' },
            ];
            expect(
                lockToVoteProposalUtils.getVoteByType(
                    votesByOption,
                    VoteOption.NO,
                ),
            ).toEqual(BigInt('7145'));
        });

        it('returns 0 when no one voted the specified option', () => {
            const votesByOption = [
                { type: VoteOption.NO, totalVotingPower: '123' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '12' },
            ];
            expect(
                lockToVoteProposalUtils.getVoteByType(
                    votesByOption,
                    VoteOption.YES,
                ),
            ).toEqual(BigInt('0'));
        });
    });

    describe('getOptionVotingPower', () => {
        it('returns the correctly formatted voting power when the option exists', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                {
                    type: VoteOption.YES,
                    totalVotingPower: '1000000000000000000',
                },
                {
                    type: VoteOption.NO,
                    totalVotingPower: '2000000000000000000',
                },
            ];
            const proposal: ILockToVoteProposal = generateLockToVoteProposal({
                settings: generateLockToVotePluginSettings({
                    token: generateTokenPluginSettingsToken({ decimals: 18 }),
                }),
                metrics: { votesByOption },
            });

            const yesVotingPower = lockToVoteProposalUtils.getOptionVotingPower(
                proposal,
                VoteOption.YES,
            );
            const noVotingPower = lockToVoteProposalUtils.getOptionVotingPower(
                proposal,
                VoteOption.NO,
            );

            expect(yesVotingPower).toEqual('1');
            expect(noVotingPower).toEqual('2');
        });

        it('returns 0 when the option does not exist', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                {
                    type: VoteOption.YES,
                    totalVotingPower: '1000000000000000000',
                },
            ];
            const proposal: ILockToVoteProposal = generateLockToVoteProposal({
                settings: generateLockToVotePluginSettings({
                    token: generateTokenPluginSettingsToken({ decimals: 18 }),
                }),
                metrics: { votesByOption },
            });

            const noVotingPower = lockToVoteProposalUtils.getOptionVotingPower(
                proposal,
                VoteOption.NO,
            );

            expect(noVotingPower).toEqual('0');
        });

        it('handles different decimals correctly', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                { type: VoteOption.YES, totalVotingPower: '1000000' },
                { type: VoteOption.NO, totalVotingPower: '2500000' },
            ];
            const proposal: ILockToVoteProposal = generateLockToVoteProposal({
                settings: generateLockToVotePluginSettings({
                    token: generateTokenPluginSettingsToken({ decimals: 6 }),
                }),
                metrics: { votesByOption },
            });

            const yesVotingPower = lockToVoteProposalUtils.getOptionVotingPower(
                proposal,
                VoteOption.YES,
            );
            const noVotingPower = lockToVoteProposalUtils.getOptionVotingPower(
                proposal,
                VoteOption.NO,
            );

            expect(yesVotingPower).toEqual('1');
            expect(noVotingPower).toEqual('2.5');
        });

        it('returns 0 when votesByOption is empty', () => {
            const proposal: ILockToVoteProposal = generateLockToVoteProposal({
                settings: generateLockToVotePluginSettings({
                    token: generateTokenPluginSettingsToken({ decimals: 18 }),
                }),
                metrics: { votesByOption: [] },
            });

            const yesVotingPower = lockToVoteProposalUtils.getOptionVotingPower(
                proposal,
                VoteOption.YES,
            );

            expect(yesVotingPower).toEqual('0');
        });
    });

    describe('getProposalTokenTotalSupply', () => {
        it('returns the historical total supply when set', () => {
            const historicalTotalSupply = '1000000';
            const proposal = generateLockToVoteProposal({
                settings: generateLockToVotePluginSettings({
                    historicalTotalSupply,
                }),
            });
            expect(
                lockToVoteProposalUtils.getProposalTokenTotalSupply(proposal),
            ).toEqual(historicalTotalSupply);
        });

        it('returns the total supply of the token when having no historical total supply', () => {
            const historicalTotalSupply = undefined;
            const totalSupply = '123456';
            const token = generateTokenPluginSettingsToken({ totalSupply });
            const proposal = generateLockToVoteProposal({
                settings: generateLockToVotePluginSettings({
                    historicalTotalSupply,
                    token,
                }),
            });
            expect(
                lockToVoteProposalUtils.getProposalTokenTotalSupply(proposal),
            ).toEqual(totalSupply);
        });
    });
});
