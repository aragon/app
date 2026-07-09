import {
    type IProposalActionsArrayControls,
    type ProposalActionComponent,
    ProposalActions,
} from '@aragon/gov-ui-kit';
import { proposalActionUtils } from '../../utils/proposalActionUtils';
import type { IProposalActionData } from '../createProposalForm';

export interface IProposalActionsEditListProps {
    /**
     * Actions to render, merged with their watched form values.
     */
    actionsMerged: IProposalActionData[];
    /**
     * Action components keyed by action type, used to render each action.
     */
    customActionComponents: Record<
        string,
        ProposalActionComponent<IProposalActionData>
    >;
    /**
     * Chain ID of the DAO the actions target.
     */
    chainId?: number;
    /**
     * Builds the move/remove controls for the action at the given index.
     */
    getArrayControls: (
        index: number,
    ) => IProposalActionsArrayControls<IProposalActionData>;
}

const noOpActionsChange = () => undefined;

/**
 * Renders the editable list of proposal actions shared by the proposal and
 * direct-execute action editors.
 */
export const ProposalActionsEditList: React.FC<
    IProposalActionsEditListProps
> = (props) => {
    const { actionsMerged, customActionComponents, chainId, getArrayControls } =
        props;

    const expandedActions = actionsMerged
        .map((action) => action.fieldId)
        .filter((id): id is string => id != null);

    return (
        <ProposalActions.Root
            editMode={true}
            expandedActions={expandedActions}
            onExpandedActionsChange={noOpActionsChange}
        >
            <ProposalActions.Container emptyStateDescription="">
                {actionsMerged.map((action, index) => (
                    <ProposalActions.Item<IProposalActionData>
                        action={action}
                        actionCount={actionsMerged.length}
                        actionFunctionSelector={proposalActionUtils.actionToFunctionSelector(
                            action,
                        )}
                        arrayControls={getArrayControls(index)}
                        CustomComponent={customActionComponents[action.type]}
                        chainId={chainId}
                        editMode={true}
                        formPrefix={`actions.${index.toString()}`}
                        key={action.fieldId}
                        value={action.fieldId}
                    />
                ))}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};
