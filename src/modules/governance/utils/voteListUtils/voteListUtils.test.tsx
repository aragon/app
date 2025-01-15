import { IVote } from '@/modules/governance/api/governanceService';
import { generateProposal, generateVote } from '@/modules/governance/testUtils';
import { voteListUtils } from '@/modules/governance/utils/voteListUtils/voteListUtils';

describe('VoteListUtils', () => {
    describe('getProcessedProposalLink', () => {
        it('returns parent proposal link when parentProposal is defined', () => {
            const parentId = 'parent-id';
            const parentTitle = 'Parent Proposal';
            const subId = 'sub-id';
            const subTitle = 'Sub Proposal';
            const daoId = 'dao-id';
            const vote: IVote = generateVote({
                parentProposal: { id: parentId, title: parentTitle },
                proposal: generateProposal({ id: subId, title: subTitle }),
            });
            const link = voteListUtils.getProcessedProposalLink(vote, daoId);
            expect(link).toBe(`/dao/${daoId}/proposals/${parentId}`);
            expect(link).not.toBe(`/dao/${daoId}/proposals/${subId}`);
        });

        it('returns child proposal link when parentProposal is not defined', () => {
            const subId = 'sub-id';
            const subTitle = 'Sub Proposal';
            const daoId = 'dao-id';
            const vote: IVote = generateVote({
                proposal: generateProposal({ id: subId, title: subTitle }),
            });
            const link = voteListUtils.getProcessedProposalLink(vote, daoId);
            expect(link).toBe(`/dao/${daoId}/proposals/${subId}`);
        });
    });

    describe('getProcessedProposalTitle', () => {
        it('returns parent proposal title when parentProposal is defined', () => {
            const parentId = 'parent-id';
            const parentTitle = 'Parent Proposal';
            const subId = 'sub-id';
            const subTitle = 'Sub Proposal';
            const vote: IVote = generateVote({
                parentProposal: { id: parentId, title: parentTitle },
                proposal: generateProposal({ id: subId, title: subTitle }),
            });
            const title = voteListUtils.getProcessedProposalTitle(vote);
            expect(title).toBe(parentTitle);
        });

        it('returns child proposal title when parentProposal is not defined', () => {
            const subId = 'sub-id';
            const subTitle = 'Sub Proposal';
            const vote: IVote = generateVote({
                proposal: generateProposal({ id: subId, title: subTitle }),
            });
            const title = voteListUtils.getProcessedProposalTitle(vote);
            expect(title).toBe(subTitle);
        });
    });
});
