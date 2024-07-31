import { type IProposalAction, ProposalActionType } from '@aragon/ods';

enum ProposalActionTypeBackend {
    Transfer = 'Transfer',
    Mint = 'Mint',
    MultisigAddMembers = 'MultisigAddMembers',
    MultisigRemoveMembers = 'MultisigRemoveMembers',
    MetadataUpdate = 'MetadataUpdate',
    UpdateMultiSigSettings = 'UpdateMultiSigSettings',
    UpdateVoteSettings = 'UpdateVoteSettings',
}

class ProposalActionUtils {
    actionTypeMapping: { [key in ProposalActionTypeBackend]: ProposalActionType } = {
        [ProposalActionTypeBackend.Transfer]: ProposalActionType.WITHDRAW_TOKEN,
        [ProposalActionTypeBackend.Mint]: ProposalActionType.TOKEN_MINT,
        [ProposalActionTypeBackend.MultisigAddMembers]: ProposalActionType.ADD_MEMBERS,
        [ProposalActionTypeBackend.MultisigRemoveMembers]: ProposalActionType.REMOVE_MEMBERS,
        [ProposalActionTypeBackend.MetadataUpdate]: ProposalActionType.UPDATE_METADATA,
        [ProposalActionTypeBackend.UpdateMultiSigSettings]: ProposalActionType.CHANGE_SETTINGS_MULTISIG,
        [ProposalActionTypeBackend.UpdateVoteSettings]: ProposalActionType.CHANGE_SETTINGS_TOKENVOTE,
    };

    normalizeActions(fetchedActions: IProposalAction[]): IProposalAction[] {
        return fetchedActions
            .map((action) => {
                const mappedType = this.actionTypeMapping[action.type as ProposalActionTypeBackend];
            
                return {
                    ...action,
                    type: mappedType,
                };
            })
    }
}

const proposalActionUtils = new ProposalActionUtils();

export default proposalActionUtils;
