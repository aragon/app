import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { TransactionDialog } from '@/shared/components/transactionDialog';
import { type TransactionDialogTransaction } from '@/shared/components/transactionDialog/transactionDialog';
import { useMemo } from 'react';
import type { ICreateProposalFormData } from '../../components/createProposalForm';

export interface IPublishProposalDialogProps extends IDialogComponentProps<ICreateProposalFormData> {}

const prepareTransaction = (params: ICreateProposalFormData): Promise<TransactionDialogTransaction> => {
    return Promise.resolve({ to: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05', data: '0x' });
};

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = (props) => {
    const { location } = props;

    const pinJsonMutation = usePinJson();

    const customSteps = useMemo(
        () => [
            {
                id: 'ipfs',
                order: 0,
                meta: {
                    label: 'Pin data on IPFS',
                    stateLabels: { error: 'Unable to pin data on IPFS' },
                    state: pinJsonMutation.status,
                },
            },
        ],
        [pinJsonMutation],
    );

    return (
        <TransactionDialog
            title="Publish proposal"
            description="To publish your proposal you have to confirm the onchain transaction with your wallet."
            submitLabel="Publish proposal"
            // steps={[]}
            prepareTransaction={() => prepareTransaction(location.params!)}
        />
    );
};
