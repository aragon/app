import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { IProposalActionData } from '../../components/createProposalForm';

export interface INestedActionsDialogParams {
    /**
     * ID of the DAO the nested actions are composed for.
     */
    daoId?: string;
    /**
     * Alternative to `daoId` if the intention is to use component  outside DAO context.
     */
    network?: Network;
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
