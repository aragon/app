import { type IProposalAction, ProposalActionType } from '../proposalActionsDefinitions';
import type {
    IProposalActionChangeMembers,
    IProposalActionChangeSettings,
    IProposalActionTokenMint,
} from '../proposalActionsList';

class ProposalActionsItemUtils {
    isActionSupported = (action: IProposalAction) => Object.keys(ProposalActionType).includes(action.type);

    isChangeMembersAction = (action: Partial<IProposalAction>): action is IProposalActionChangeMembers =>
        action.type === ProposalActionType.ADD_MEMBERS || action.type === ProposalActionType.REMOVE_MEMBERS;

    isTokenMintAction = (action: Partial<IProposalAction>): action is IProposalActionTokenMint =>
        action.type === ProposalActionType.TOKEN_MINT;

    isChangeSettingsAction = (action: Partial<IProposalAction>): action is IProposalActionChangeSettings =>
        action.type === ProposalActionType.CHANGE_SETTINGS_MULTISIG ||
        action.type === ProposalActionType.CHANGE_SETTINGS_TOKENVOTE;
}

export const proposalActionsItemUtils = new ProposalActionsItemUtils();
