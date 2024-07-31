import { generateProposalActionChangeMembers } from '@/modules/governance/testUtils/generators/proposalActionChangeMembers';
import { generateProposalActionChangeSettings } from '@/modules/governance/testUtils/generators/proposalActionChangeSettings';
import { ProposalActionType, type IProposalAction, type IProposalActionChangeMembers } from '@aragon/ods';
import proposalActionUtils from './proposalActionUtils';

describe('ProposalActionUtils', () => {
    it('should map known action types correctly', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeMembers({ type: 'MultisigAddMembers' as IProposalActionChangeMembers['type'] }),
            generateProposalActionChangeSettings({ type: 'UpdateMultiSigSettings' }),
        ];

        const transformedActions = proposalActionUtils.normalizeActions(fetchedActions);

        expect(transformedActions).toHaveLength(2);
        expect(transformedActions[0].type).toEqual(ProposalActionType.ADD_MEMBERS);
        expect(transformedActions[1].type).toEqual(ProposalActionType.CHANGE_SETTINGS_MULTISIG);
    });

    it('should return null for unknown action types and filter them out', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeMembers({ type: 'UnknownActionType' as IProposalActionChangeMembers['type'] }),
            generateProposalActionChangeSettings({ type: 'UnknownActionType' }),
        ];

        const transformedActions = proposalActionUtils.normalizeActions(fetchedActions);

        expect(transformedActions).toHaveLength(0);
    });
});
