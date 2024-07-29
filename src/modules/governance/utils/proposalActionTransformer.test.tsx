import { generateProposalActionChangeMembers } from '@/modules/governance/testUtils/generators/proposalActionChangeMembers';
import { generateProposalActionChangeSettings } from '@/modules/governance/testUtils/generators/proposalActionChangeSettings';
import { ProposalActionType, type IProposalAction, type IProposalActionChangeMembers } from '@aragon/ods';
import proposalActionTransformer from './proposalActionTransformer';

describe('ActionTransformer', () => {
    it('should map known action types correctly', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeMembers({ type: 'MultisigAddMembers' as IProposalActionChangeMembers['type'] }),
            generateProposalActionChangeSettings({ type: 'UpdateMultiSigSettings' }),
        ];

        const transformedActions = proposalActionTransformer.transform(fetchedActions);

        expect(transformedActions).toHaveLength(2);
        expect(transformedActions[0].type).toEqual(ProposalActionType.ADD_MEMBERS);
        expect(transformedActions[1].type).toEqual(ProposalActionType.CHANGE_SETTINGS_MULTISIG);
    });

    it('should return null for unknown action types and filter them out', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeMembers({ type: 'UnknownActionType' as IProposalActionChangeMembers['type'] }),
            generateProposalActionChangeSettings({ type: 'UnknownActionType' }),
        ];

        const transformedActions = proposalActionTransformer.transform(fetchedActions);

        expect(transformedActions).toHaveLength(0);
    });
});
