import { ProposalStatus } from '@aragon/ods';
import { adminProposalUtils } from './adminProposalUtils';

describe('adminProposal utils', () => {
    describe('getProposalStatus', () => {
        it('returns EXECUTED status', () => {
            expect(adminProposalUtils.getProposalStatus()).toEqual(ProposalStatus.EXECUTED);
        });
    });
});
