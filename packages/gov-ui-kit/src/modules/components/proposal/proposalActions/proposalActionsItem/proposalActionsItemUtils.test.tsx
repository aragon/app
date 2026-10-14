import { ProposalActionType } from '../proposalActionsDefinitions';
import { generateProposalActionChangeMembers } from '../proposalActionsList';
import { generateProposalAction } from '../proposalActionsTestUtils';
import { proposalActionsItemUtils } from './proposalActionsItemUtils';

describe('ProposalActions utils', () => {
    describe('isActionSupported', () => {
        it('returns true if action is of any supported type', () => {
            const action = generateProposalAction({ type: ProposalActionType.ADD_MEMBERS });
            expect(proposalActionsItemUtils.isActionSupported(action)).toBeTruthy();
        });

        it('returns false if action is not supported', () => {
            const action = generateProposalAction({ type: 'unknown' });
            expect(proposalActionsItemUtils.isActionSupported(action)).toBeFalsy();
        });
    });

    describe('isChangeMemberAction', () => {
        it('returns true for change members actions', () => {
            const addMembersAction = generateProposalActionChangeMembers({ type: ProposalActionType.ADD_MEMBERS });
            const removeMembersAction = generateProposalActionChangeMembers({
                type: ProposalActionType.REMOVE_MEMBERS,
            });
            expect(proposalActionsItemUtils.isChangeMembersAction(addMembersAction)).toBeTruthy();
            expect(proposalActionsItemUtils.isChangeMembersAction(removeMembersAction)).toBeTruthy();
        });

        it('returns false for other actions', () => {
            const action = generateProposalAction({ type: 'OTHER_ACTION' });
            expect(proposalActionsItemUtils.isChangeMembersAction(action)).toBeFalsy();
        });
    });
});
