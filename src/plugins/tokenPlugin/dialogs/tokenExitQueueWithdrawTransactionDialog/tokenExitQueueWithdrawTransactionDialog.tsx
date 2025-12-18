'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { encodeFunctionData } from 'viem';
import { TransactionType } from '@/shared/api/transactionService';
import { type ITransactionDialogStepMeta, TransactionDialog, TransactionDialogStep } from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import type { ITokenExitQueueWithdrawTransactionDialogProps } from './tokenExitQueueWithdrawTransactionDialog.api';

export const TokenExitQueueWithdrawTransactionDialog: React.FC<ITokenExitQueueWithdrawTransactionDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenExitQueueWithdrawTransactionDialog: required parameters must be set.');

    const { tokenId, token, escrowAddress, network, onSuccess } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => {
        // Call withdraw on VotingEscrow, which will internally call exit on DynamicExitQueue
        const veAbi = [
            {
                type: 'function',
                name: 'withdraw',
                inputs: [{ name: '_tokenId', type: 'uint256' }],
                outputs: [],
            },
        ] as const;

        const data = encodeFunctionData({
            abi: veAbi,
            functionName: 'withdraw',
            args: [tokenId],
        });

        return Promise.resolve({
            to: escrowAddress,
            data,
            value: BigInt(0),
        });
    };

    return (
        <TransactionDialog
            description={t('app.plugins.tokenExitQueue.withdrawTransactionDialog.description', {
                symbol: token.symbol,
            })}
            network={network}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t('app.plugins.tokenExitQueue.withdrawTransactionDialog.submit')}
            successLink={{
                label: t('app.plugins.tokenExitQueue.withdrawTransactionDialog.success'),
                onClick: () => {
                    router.refresh();
                    onSuccess?.();
                },
            }}
            title={t('app.plugins.tokenExitQueue.withdrawTransactionDialog.title', { symbol: token.symbol })}
            transactionType={TransactionType.WITHDRAW_CREATE}
        />
    );
};
