import type { Hex } from 'viem';
import type {
    IProposalCreateAction,
    PrepareProposalActionMap,
} from '../../dialogs/publishProposalDialog';

export interface IPrepareActionsParams {
    /**
     * List of actions of the proposal.
     */
    actions: IProposalCreateAction[];
    /**
     * Partial map of action-type and prepare-action function.
     */
    prepareActions?: PrepareProposalActionMap;
}

class ProposalActionPreparationUtils {
    prepareActions = async (params: IPrepareActionsParams) => {
        const { actions, prepareActions } = params;

        const prepareActionDataPromises = actions.map(async (action) => {
            const prepareFunction = action.type
                ? prepareActions?.[action.type]
                : undefined;
            const actionData = await (prepareFunction != null
                ? prepareFunction(action)
                : action.data);

            return actionData;
        });

        const resolvedActionDataPromises = (await Promise.all(
            prepareActionDataPromises,
        )) as Hex[];

        const processedActions = actions.map((action, index) => ({
            ...action,
            data: resolvedActionDataPromises[index],
        }));

        return processedActions;
    };
}

export const proposalActionPreparationUtils =
    new ProposalActionPreparationUtils();
