import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import type { Hex } from 'viem';

class TokenDelegationFormDialogUtils {
    buildTransaction = () => {
        const transaction: TransactionDialogPrepareReturn = {
            to: '0x' as Hex,
            data: '0x',
        };

        return Promise.resolve(transaction);
    };
}

export const tokenDelegationFormDialogUtils = new TokenDelegationFormDialogUtils();
