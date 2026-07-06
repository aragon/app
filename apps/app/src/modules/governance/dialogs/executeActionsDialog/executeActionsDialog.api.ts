import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { IProposalActionData } from '../../components/createProposalForm/createProposalFormDefinitions';
import type { PrepareProposalActionMap } from '../publishProposalDialog';

export interface IExecuteActionsDialogParams {
    /**
     * ID of the DAO to execute the actions on.
     */
    daoId: string;
    /**
     * Actions to be executed directly on the DAO.
     */
    actions: IProposalActionData[];
    /**
     * Partial map of action-type and prepare-action functions as not all actions require an async data preparation.
     */
    prepareActions?: PrepareProposalActionMap;
}

export interface IExecuteActionsDialogProps
    extends IDialogComponentProps<IExecuteActionsDialogParams> {}
