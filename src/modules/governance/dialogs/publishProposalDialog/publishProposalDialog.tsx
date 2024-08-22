import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { TransactionDialog } from '@/shared/components/transactionDialog';
import { useMemo } from 'react';

export interface IPublishProposalDialogParams {
    /**
     * Create proposal form values to build the transaction for.
     */
    formValues: unknown;
}

export interface IPublishProposalDialogProps extends IDialogComponentProps {}

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = () => {
    const pinJsonMutation = usePinJson();

    const customSteps = useMemo(
        () => [{ status: pinJsonMutation.status, id: 'ipfs', stateLabels: { error: 'Unable to pin data on IPFS' } }],
        [pinJsonMutation],
    );

    return (
        <TransactionDialog
            title="Publish proposal"
            description="To publish your proposal you have to confirm the onchain transaction with your wallet."
            submitLabel="Publish proposal"
            steps={customSteps}
            prepareTransaction={() => Promise.resolve({ from: '0x123', to: '0x123', data: '0x' } as any)}
        />
    );
};
