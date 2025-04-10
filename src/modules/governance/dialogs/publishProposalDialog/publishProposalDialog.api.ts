import type { ITransactionRequest } from "@/shared/utils/transactionUtils";
import type { ICreateProposalFormData, PrepareProposalActionMap } from "../../components/createProposalForm";
import type { IDaoPlugin } from "@/shared/api/daoService";
import type { IDialogComponentProps } from "@/shared/components/dialogProvider";

export interface IProposalCreateAction extends ITransactionRequest {
    /**
     * Type of the action to be used when passing the prepareActions property.
     */
    type?: string;
}


export interface IProposalCreate extends Omit<ICreateProposalFormData, 'addActions' | 'actions'> {
    /**
     * Array of actions to be executed on the proposal with only the necessary to, data and value properties.
     */
    actions: IProposalCreateAction[];
}


export interface IPublishProposalDialogParams {
    /**
     * data for creating the proposal.
     */
    proposal: IProposalCreate;
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     *  Plugin used a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Partial map of action-type and prepare-action functions as not all actions require an async data preparation.
     */
    prepareActions?: PrepareProposalActionMap;
}

export interface IPublishProposalDialogProps extends IDialogComponentProps<IPublishProposalDialogParams> {}


