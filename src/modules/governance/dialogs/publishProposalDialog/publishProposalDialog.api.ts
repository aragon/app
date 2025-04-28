import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import type { ITransactionInfo } from '@/shared/components/transactionStatus';
import type { IProposal, IProposalAction } from '../../api/governanceService';

export type PrepareProposalActionFunction<TAction extends IProposalCreateAction = IProposalCreateAction> = (
    action: TAction,
) => Promise<string>;

export type PrepareProposalActionMap<TAction extends IProposalCreateAction = IProposalCreateAction> = Partial<
    Record<string, PrepareProposalActionFunction<TAction>>
>;

export interface IProposalCreateAction extends Pick<IProposalAction, 'to' | 'data'> {
    /**
     * Value of the transaction.
     */
    value: bigint | string;
    /**
     * Type of the action to be used when passing the prepareActions property.
     */
    type?: string;
}

export interface IProposalCreate<TAction extends IProposalCreateAction = IProposalCreateAction>
    extends Pick<IProposal, 'title' | 'summary' | 'resources'> {
    /**
     * Long description of the proposal supporting HTML tags.
     */
    body?: string;
    /**
     * Array of actions to be executed on the proposal with only the necessary to, data and value properties.
     */
    actions: TAction[];
}

export interface IPublishProposalDialogParams<TAction extends IProposalCreateAction = IProposalCreateAction> {
    /**
     * data for creating the proposal.
     */
    proposal: IProposalCreate<TAction>;
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Plugin used a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Partial map of action-type and prepare-action functions as not all actions require an async data preparation.
     */
    prepareActions?: PrepareProposalActionMap<TAction>;
    /**
     * Translation namespace to customise strings.
     */
    translationNamespace?: string;
    /**
     * Information about the stepper in the current transaction dialog.
     */
    transactionInfo?: ITransactionInfo;
}

export interface IPublishProposalDialogProps extends IDialogComponentProps<IPublishProposalDialogParams> {}
