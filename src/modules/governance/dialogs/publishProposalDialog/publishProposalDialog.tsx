import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { TransactionDialog } from '@/shared/components/transactionDialog';

export interface IPublishProposalDialogParams {
    /**
     * Create proposal form values to build the transaction for.
     */
    formValues: unknown;
}

export interface IPublishProposalDialogProps extends IDialogComponentProps {}

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = () => {
    const pinJsonMutation = usePinJson();

    return (
        <TransactionDialog
            title="Publish proposal"
            description="To publish your proposal you have to confirm the onchain transaction with your wallet."
        />
    );
};
