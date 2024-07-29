import { type IProposalAction, ProposalActionType } from "@aragon/ods";


class ActionTransformer {
    private actionTypeMapping: { [key: string]: ProposalActionType } = {
        'MultisigAddMembers': ProposalActionType.ADD_MEMBERS,
        'UpdateMultiSigSettings': ProposalActionType.CHANGE_SETTINGS_MULTISIG,
    };

    transform(fetchedActions: IProposalAction[]): IProposalAction[] {
        return fetchedActions.map(action => {
            const mappedType = this.actionTypeMapping[action.type];
            if (!mappedType) {
                console.warn(`No mapping found for action type: ${action.type}`);
                return null;
            }
            return {
                ...action,
                type: mappedType,
            };
        }).filter(action => action !== null) as IProposalAction[];
    }
}

const proposalActionTransformer = new ActionTransformer();

export default proposalActionTransformer;