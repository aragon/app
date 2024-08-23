import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';

class PublishProposalDialogUtils {
    prepareTransaction = () => {
        const transaction: TransactionDialogPrepareReturn = {
            to: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
            data: '0x',
        };

        return Promise.resolve(transaction);
    };
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
