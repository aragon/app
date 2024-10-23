import { ProposalStatus } from '@aragon/gov-ui-kit';
import { adminProposalUtils } from './adminProposalUtils';

describe('adminProposal utils', () => {
    describe('getProposalStatus', () => {
        it('returns EXECUTED status', () => {
            expect(adminProposalUtils.getProposalStatus()).toEqual(ProposalStatus.EXECUTED);
        });
    });
});
