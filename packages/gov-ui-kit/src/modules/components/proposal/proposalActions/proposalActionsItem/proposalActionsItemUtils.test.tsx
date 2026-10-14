import { ProposalActionType } from '../proposalActionsDefinitions';
import { generateProposalActionChangeMembers, generateProposalActionChangeSettings } from '../proposalActionsList';
import { generateProposalAction } from '../proposalActionsTestUtils';
import { proposalActionsItemUtils } from './proposalActionsItemUtils';

describe('ProposalActions utils', () => {
    describe('isActionSupported', () => {
        it('returns true if action is of any supported type', () => {
            const action = generateProposalAction({ type: ProposalActionType.CHANGE_SETTINGS_MULTISIG });
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
            const action = generateProposalActionChangeSettings();
            expect(proposalActionsItemUtils.isChangeMembersAction(action)).toBeFalsy();
        });
    });

    describe('isChangeSettingsAction', () => {
        it('returns true for change settings actions', () => {
            const changeMultisig = generateProposalActionChangeSettings({
                type: ProposalActionType.CHANGE_SETTINGS_MULTISIG,
            });
            const changeToken = generateProposalActionChangeSettings({
                type: ProposalActionType.CHANGE_SETTINGS_TOKENVOTE,
            });
            expect(proposalActionsItemUtils.isChangeSettingsAction(changeMultisig)).toBeTruthy();
            expect(proposalActionsItemUtils.isChangeSettingsAction(changeToken)).toBeTruthy();
        });

        it('returns false for other actions', () => {
            const action = generateProposalActionChangeMembers();
            expect(proposalActionsItemUtils.isChangeSettingsAction(action)).toBeFalsy();
        });
    });
});
