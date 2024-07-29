import { generateProposalActionChangeMembers } from '@/modules/governance/testUtils/generators/proposalActionChangeMembers';
import { generateProposalActionChangeSettings } from '@/modules/governance/testUtils/generators/proposalActionChangeSettings';
import { IProposalActionChangeMembers, ProposalActionType, type IProposalAction } from '@aragon/ods';
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

    it('should log a warning for unknown action types', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeSettings({ type: 'UnknownActionType' as IProposalAction['type'] }),
        ];

        proposalActionTransformer.transform(fetchedActions);

        expect(consoleWarnSpy).toHaveBeenCalledWith(`No mapping found for action type: ${fetchedActions[0].type}`);

        consoleWarnSpy.mockRestore();
    });
});
