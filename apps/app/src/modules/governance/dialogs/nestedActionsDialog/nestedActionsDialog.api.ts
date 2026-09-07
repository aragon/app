import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { IProposalActionData } from '../../components/createProposalForm';

export interface INestedActionsDialogParams {
    /**
     * ID of the DAO the nested actions are composed for.
     * Host DAO -> process -> create proposal -> actions (action1, action2WithNstedActions, action 3)
     * Nested actions could be cross-chain, so it is basically configured for another DAO on another chain.
     * Host DAO's process can define allowed actions also for other chains.
     */
    hostDaoId: string;
    /**
     * Address of the process plugin restricting the actions that can be composed. When omitted no allowed
     * actions are fetched and every action is offered by the composer.
     */
    processPluginAddress?: string;
    /**
     * Network the nested actions are composed for, defaults to the network of the DAO. Set it when
     * the actions are executed on another chain than the DAO, e.g. when they are forwarded to a
     * cross-chain controller.
     */
    crossChainNetwork?: Network;
    /**
     * Actions to seed the isolated dialog form with, used to edit a previously composed selection.
     */
    initialActions: IProposalActionData[];
    /**
     * Action types to hide from the nested action composer, e.g. to stop an action from being
     * nested into itself.
     */
    excludeActionTypes?: string[];
    /**
     * Callback called with the prepared actions when the user saves the dialog.
     */
    onSubmit: (actions: IProposalActionData[]) => void;
}

export interface INestedActionsDialogProps
    extends IDialogComponentProps<INestedActionsDialogParams> {}

export interface INestedActionsFormData {
    /**
     * Nested actions composed inside the dialog.
     */
    actions: IProposalActionData[];
}
