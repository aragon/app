import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { ProposalActionType } from './enum';
import type { IProposalAction } from './proposalAction';

export interface IProposalActionChangeSettings extends IProposalAction {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.CHANGE_SETTINGS;
    /**
     * The settings proposed by the action, as term/definition pairs.
     */
    proposedSettings: IDefinitionSetting[];
    /**
     * The settings in place when the proposal was created, as term/definition pairs.
     */
    existingSettings: IDefinitionSetting[];
}
