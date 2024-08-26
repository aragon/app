import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import type { TransactionReceipt } from 'viem';

class PublishProposalDialogUtils {
    prepareMetadata = () => {
        return { test: 'value' };
    };

    buildTransaction = () => {
        const transaction: TransactionDialogPrepareReturn = {
            to: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
            data: '0x',
        };

        return Promise.resolve(transaction);
    };

    getProposalId = (receipt: TransactionReceipt) => receipt.to;
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
